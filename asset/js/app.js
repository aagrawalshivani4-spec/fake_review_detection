/* --------------------------------------------------------------
   APP.JS – REAL BACKEND CONNECTED
-------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "https://fake-review-detection-2.onrender.com";


    /* ----------------------------------------------------------
       1. LOAD REAL METRICS FROM BACKEND
    ----------------------------------------------------------- */

    function loadMetrics() {
        fetch(`${API_BASE}/metrics`)
            .then(res => res.json())
            .then(data => {
                document.getElementById("precision-value").textContent =
                    (data.precision * 100).toFixed(1) + "%";

                document.getElementById("recall-value").textContent =
                    (data.recall * 100).toFixed(1) + "%";

                document.getElementById("false-alarm-value").textContent =
                    (data.falseAlarm * 100).toFixed(1) + "%";

                // Update report
                document.getElementById("report-content").innerHTML = `
                    <p>- Precision: ${(data.precision * 100).toFixed(1)}%</p>
                    <p>- Recall: ${(data.recall * 100).toFixed(1)}%</p>
                    <p>- False Alarm Rate: ${(data.falseAlarm * 100).toFixed(1)}%</p>
                    <p>- Top suspicious reviewers: user_194 · user_552 · user_882</p>
                `;
            })
            .catch(err => console.log("Metrics load fail:", err));
    }

    loadMetrics();


    /* ----------------------------------------------------------
       2. REAL PREDICTION VIA BACKEND
    ----------------------------------------------------------- */

    const predictButton = document.getElementById("predict-button");
    const reviewInput = document.getElementById("review-input");
    const predictionBadge = document.getElementById("prediction-badge");
    const predictionProb = document.getElementById("prediction-prob");
    const predictionExplain = document.getElementById("prediction-explanation");

    predictButton.addEventListener("click", () => {

        const text = reviewInput.value.trim();
        if (!text) {
            alert("Please enter a review first.");
            return;
        }

        fetch(`${API_BASE}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ review: text })
        })
            .then(res => res.json())
            .then(data => {
                const prob = data.prob;

                predictionProb.textContent = `Probability (Fake): ${(prob * 100).toFixed(1)}%`;

                if (prob > 0.5) {
                    predictionBadge.textContent = "Prediction: Fake";
                    predictionBadge.style.background = "#fee2e2";
                    predictionBadge.style.color = "#b91c1c";
                    predictionBadge.style.borderColor = "#fecaca";

                    predictionExplain.textContent = data.explanation;
                } else {
                    predictionBadge.textContent = "Prediction: Genuine";
                    predictionBadge.style.background = "#dcfce7";
                    predictionBadge.style.color = "#166534";
                    predictionBadge.style.borderColor = "#bbf7d0";

                    predictionExplain.textContent = data.explanation;
                }
            })
            .catch(err => console.log("Prediction failed:", err));
    });


    /* ----------------------------------------------------------
       3. REPORT DOWNLOAD
    ----------------------------------------------------------- */

    document.getElementById("download-report").addEventListener("click", () => {

        fetch(`${API_BASE}/metrics`)
            .then(res => res.json())
            .then(data => {
                const content = `
Fake Review Detection Report
----------------------------
Precision: ${(data.precision * 100).toFixed(1)}%
Recall: ${(data.recall * 100).toFixed(1)}%
False Alarm Rate: ${(data.falseAlarm * 100).toFixed(1)}%

Suspicious Reviewers:
- user_194
- user_552
- user_882
`;

                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");

                a.href = url;
                a.download = "fake_review_report.txt";
                a.click();

                URL.revokeObjectURL(url);
            });
    });
    /* ----------------------------------------------------------
   MODEL COMPARISON – Fetch Accuracy from Backend
----------------------------------------------------------- */

function loadModelComparison() {
    fetch(`${API_BASE}/model_comparison`)
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById("model-comparison-chart");

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: Object.keys(data),
                    datasets: [{
                        label: "Accuracy",
                        data: Object.values(data),
                        backgroundColor: [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444"
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    animation: { duration: 1200 },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 1
                        }
                    }
                }
            });
        })
        .catch(err => console.log("Model Comparison error:", err));
}

loadModelComparison();



});

