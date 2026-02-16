#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
using namespace std;

struct Process
{
    string name;
    int arrival;
    int service;
    int remaining;
    int completion;
};

int main()
{
    string operation;
    getline(cin, operation);

    string algoLine;
    getline(cin, algoLine);

    int quantum = 0;
    int algorithm = algoLine[0] - '0';

    if (algorithm == 2)
    {
        quantum = stoi(algoLine.substr(2));
    }

    int timeLimit;
    cin >> timeLimit;

    int n;
    cin >> n;

    vector<Process> processes(n);

    for (int i = 0; i < n; i++)
    {
        char comma;
        cin >> processes[i].name >> comma >> processes[i].arrival >> comma >> processes[i].service;
        processes[i].remaining = processes[i].service;
    }

    int time = 0;
    float totalWaiting = 0;
    float totalTurnaround = 0;

    if (algorithm == 1)
    { // FCFS
        sort(processes.begin(), processes.end(),
             [](Process a, Process b)
             {
                 return a.arrival < b.arrival;
             });

        for (auto &p : processes)
        {
            if (time < p.arrival)
                time = p.arrival;

            time += p.service;
            p.completion = time;

            totalTurnaround += p.completion - p.arrival;
            totalWaiting += p.completion - p.arrival - p.service;
        }
    }

    else if (algorithm == 2)
    { // Round Robin
        queue<int> q;
        sort(processes.begin(), processes.end(),
             [](Process a, Process b)
             {
                 return a.arrival < b.arrival;
             });

        int index = 0;

        while (time <= timeLimit)
        {
            while (index < n && processes[index].arrival <= time)
            {
                q.push(index++);
            }

            if (!q.empty())
            {
                int i = q.front();
                q.pop();

                int run = min(quantum, processes[i].remaining);
                processes[i].remaining -= run;
                time += run;

                while (index < n && processes[index].arrival <= time)
                {
                    q.push(index++);
                }

                if (processes[i].remaining > 0)
                {
                    q.push(i);
                }
                else
                {
                    processes[i].completion = time;
                    totalTurnaround += time - processes[i].arrival;
                    totalWaiting += time - processes[i].arrival - processes[i].service;
                }
            }
            else
            {
                time++;
            }

            if (q.empty() && index >= n)
                break;
        }
    }

    float avgWaiting = totalWaiting / n;
    float avgTurnaround = totalTurnaround / n;
    float throughput = n / (float)time;
    float cpuUtil = (time / (float)timeLimit) * 100;

    cout << "Average Waiting Time: " << avgWaiting << endl;
    cout << "Average Turnaround Time: " << avgTurnaround << endl;
    cout << "Throughput: " << throughput << endl;
    cout << "CPU Utilization: " << cpuUtil << "%" << endl;

    return 0;
}
