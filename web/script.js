let processes = [];

const colors = [
    "#ff6b6b",
    "#6bc5ff",
    "#ffd93d",
    "#6bff95",
    "#c96bff",
    "#ff9f6b",
    "#00ffc8",
    "#ff4df0"
];

function addProcess() {
    const name = document.getElementById("pname").value.trim();
    const arrival = parseInt(document.getElementById("arrival").value);
    const service = parseInt(document.getElementById("service").value);

    if (!name || isNaN(arrival) || isNaN(service)) {
        alert("Please enter valid process details!");
        return;
    }

    processes.push({ name, arrival, service });
    renderProcessList();

    document.getElementById("pname").value = "";
    document.getElementById("arrival").value = "";
    document.getElementById("service").value = "";
}

function deleteProcess(index) {
    processes.splice(index, 1);
    renderProcessList();
}

function renderProcessList() {
    let html = `
        <table border="1" style="margin-top:10px;">
            <tr>
                <th>Name</th>
                <th>Arrival</th>
                <th>Service</th>
                <th>Action</th>
            </tr>
    `;

    processes.forEach((p, index) => {
        html += `
            <tr>
                <td>${p.name}</td>
                <td>${p.arrival}</td>
                <td>${p.service}</td>
                <td>
                    <button onclick="deleteProcess(${index})">Delete</button>
                </td>
            </tr>
        `;
    });

    html += `</table>`;
    document.getElementById("processList").innerHTML = html;
}

function runSimulation() {

    if (processes.length === 0) {
        alert("Add at least one process first!");
        return;
    }

    const selectedOperation = document.getElementById("operation").value;
    const algorithm = document.getElementById("algorithm").value;
    const quantum = document.getElementById("quantum").value || 1;

    let lastInstant = 0;
    processes.forEach(p => {
        lastInstant = Math.max(lastInstant, p.arrival + p.service + 10);
    });

    // -------- ALWAYS REQUEST TRACE FIRST (for Gantt) --------
    let traceInput = "trace\n";

    if (algorithm == 2 || algorithm == 8) {
        traceInput += algorithm + "-" + quantum + "\n";
    } else {
        traceInput += algorithm + "\n";
    }

    traceInput += lastInstant + "\n";
    traceInput += processes.length + "\n";

    processes.forEach(p => {
        traceInput += `${p.name},${p.arrival},${p.service}\n`;
    });

    fetch("/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: traceInput })
    })
    .then(res => res.json())
    .then(traceData => {

        if (traceData.error) {
            document.getElementById("output").textContent = traceData.error;
            return;
        }

        // Always generate Gantt from trace
        generateGantt(traceData.output);

        // If user selected TRACE, just show trace output
        if (selectedOperation === "trace") {
            document.getElementById("output").textContent = traceData.output;
            return;
        }

        // -------- IF USER SELECTED STATS --------

        let statsInput = "stats\n";

        if (algorithm == 2 || algorithm == 8) {
            statsInput += algorithm + "-" + quantum + "\n";
        } else {
            statsInput += algorithm + "\n";
        }

        statsInput += lastInstant + "\n";
        statsInput += processes.length + "\n";

        processes.forEach(p => {
            statsInput += `${p.name},${p.arrival},${p.service}\n`;
        });

        fetch("/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: statsInput })
        })
        .then(res => res.json())
        .then(statsData => {

            if (statsData.error) {
                document.getElementById("output").textContent = statsData.error;
                return;
            }

            document.getElementById("output").textContent = statsData.output;
        });

    });
}


function generateGantt(output) {

    const gantt = document.getElementById("gantt");
    gantt.innerHTML = "";

    const lines = output.split("\n");

    const processLines = lines.filter(line =>
        line.includes("|") && !line.includes("---")
    );

    processLines.forEach((line, index) => {

        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.marginBottom = "5px";

        const label = document.createElement("div");
        label.style.width = "60px";
        label.textContent = line.split("|")[0].trim();

        row.appendChild(label);

        const blocks = line.split("|").slice(1, -1);

        blocks.forEach(cell => {
            const block = document.createElement("div");
            block.style.width = "20px";
            block.style.height = "20px";
            block.style.marginRight = "2px";
            block.style.borderRadius = "3px";
            block.style.background = "#1e1e1e";

            if (cell.trim() === "*") {
                block.style.background = colors[index % colors.length];
            }

            row.appendChild(block);
        });

        gantt.appendChild(row);
    });
}
