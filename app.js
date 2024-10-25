document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("playerName").placeholder = "Write name here";
});

const ctx = document.getElementById('skillChart').getContext('2d');
let skillChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [
            'Shooting',
            'Passing',
            'Dribbling',
            'Defense',
            'Rebounding',
            'Speed',
            'Vertical',
            'Stamina'
        ],
        datasets: [{
            label: 'Player Skill Ratings',
            data: [0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true, 
        maintainAspectRatio: false, // Allow for custom aspect ratios
        scales: {
            y: {
                beginAtZero: true,
                max: 99,
                title: {
                    display: true,
                    text: 'Skill Rating'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                    }
                }
            }
        }
    }
});

function updateChart() {
    const inputs = [
        { number: document.getElementById('shooting-number'), slider: document.getElementById('shooting-slider') },
        { number: document.getElementById('passing-number'), slider: document.getElementById('passing-slider') },
        { number: document.getElementById('dribbling-number'), slider: document.getElementById('dribbling-slider') },
        { number: document.getElementById('defense-number'), slider: document.getElementById('defense-slider') },
        { number: document.getElementById('rebounding-number'), slider: document.getElementById('rebounding-slider') },
        { number: document.getElementById('speed-number'), slider: document.getElementById('speed-slider') },
        { number: document.getElementById('vertical-number'), slider: document.getElementById('vertical-slider') },
        { number: document.getElementById('stamina-number'), slider: document.getElementById('stamina-slider') }
    ];

    let totalPoints = 0;
    let errorMessage = '';

    inputs.forEach(input => {
        const value = parseInt(input.number.value) || 0;
        input.slider.value = value; // Sync the slider with the number input
        totalPoints += value;

        // Immediate feedback: check individual skill values
        if (value < 0 || value > 99) {
            errorMessage = 'Each skill must be between 0 and 99.';
        }
    });

    if (totalPoints > 400) {
        errorMessage = 'Total points must not exceed 400.';
    }

    document.getElementById('error').textContent = errorMessage;

    if (!errorMessage) {
        skillChart.data.datasets[0].data = inputs.map(input => parseInt(input.number.value) || 0);
        skillChart.update();
    }
}

// Restrict input values based on remaining points
function restrictInputValue(input) {
    input.addEventListener('input', function() {
        const totalPoints = [...document.querySelectorAll('input[type="number"]')]
            .reduce((sum, inp) => sum + (parseInt(inp.value) || 0), 0);
        const remainingPoints = 400 - totalPoints + (parseInt(this.value) || 0); // Calculate remaining points based on the current input

        if (this.value > 99) {
            this.value = 99;
        } else if (this.value < 0) {
            this.value = 0;
        } else if (this.value > remainingPoints && remainingPoints >= 0) {
            this.value = remainingPoints;
        }

        // Adjust to the remaining points if the input exceeds it
        if (this.value > remainingPoints) {
            this.value = remainingPoints; // Set to remaining points if exceeded
        }

        updateChart(); // Update the chart after input changes
    });
}

// Sync sliders with number inputs
document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', function() {
        const numberInput = this.previousElementSibling; // Get the corresponding number input
        const lastValue = parseInt(numberInput.value) || 0; // Store the last value
        
        numberInput.value = this.value; // Set number input to the slider's value
        
        // Only allow adjustment when total points is less than 400
        const totalPoints = [...document.querySelectorAll('input[type="number"]')]
            .reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);

        if (totalPoints < 400) {
            updateChart(); // Update chart if total points are below 400
        } else {
            // If total points are 400 or more, revert the slider to the last valid number
            this.value = lastValue; // Revert slider value
            numberInput.value = lastValue; // Sync back to the number input
            document.getElementById('error').textContent = 'Total points must not exceed 400.';
        }
    });
});

// Apply input restrictions to each number input
document.querySelectorAll('input[type="number"]').forEach(input => {
    restrictInputValue(input);
});
