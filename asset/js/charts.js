/* --------------------------------------------------------------
   CHARTS.JS – Animated Metrics & Class Summary Charts
   Works with Chart.js v4+
-------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    /* ----------------------------------------------------------
       1. SAMPLE PERFORMANCE METRICS
       Replace with backend values if needed
    ---------------------------------------------------------- */

    const metrics = {
        precision: 0.91,
        recall: 0.88,
        f1: 0.89,
        falseAlarm: 0.07
    };

    /* ----------------------------------------------------------
       2. SAMPLE CONFUSION SUMMARY
    ---------------------------------------------------------- */

    const classSummary = {
        TP: 430,
        FP: 32,
        TN: 489,
        FN: 49
    };

    /* ----------------------------------------------------------
       3. METRICS BAR CHART (Precision, Recall, F1, False Alarm)
    ---------------------------------------------------------- */

    const metricsCtx = document.getElementById("metrics-bar-chart").getContext("2d");

    const metricsChart = new Chart(metricsCtx, {
        type: "bar",
        data: {
            labels: ["Precision", "Recall", "F1 Score", "False Alarm"],
            datasets: [
                {
                    label: "Score",
                    data: [
                        metrics.precision,
                        metrics.recall,
                        metrics.f1,
                        metrics.falseAlarm
                    ],
                    backgroundColor: [
                        "#2563eb",
                        "#10b981",
                        "#f59e0b",
                        "#ef4444"
                    ],
                    borderRadius: 12,
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            scales: {
                y: {
                    suggestedMin: 0,
                    suggestedMax: 1,
                    ticks: {
                        callback: (value) => value.toFixed(2)
                    }
                }
            },
            animation: {
                duration: 1200,
                easing: "easeOutQuart"
            }
        }
    });

    /* ----------------------------------------------------------
       4. CLASS SUMMARY BAR CHART (TP, FP, TN, FN)
    ---------------------------------------------------------- */

    const classCtx = document.getElementById("class-bar-chart").getContext("2d");

    const classBarChart = new Chart(classCtx, {
        type: "bar",
        data: {
            labels: ["TP", "FP", "TN", "FN"],
            datasets: [
                {
                    label: "Count",
                    data: [
                        classSummary.TP,
                        classSummary.FP,
                        classSummary.TN,
                        classSummary.FN
                    ],
                    backgroundColor: [
                        "#22c55e",
                        "#ef4444",
                        "#3b82f6",
                        "#f59e0b"
                    ],
                    borderRadius: 12,
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true }
            },
            animation: {
                duration: 1200,
                easing: "easeOutQuart"
            }
        }
    });

});
