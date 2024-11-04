// Wait until the DOM is fully loaded before executing the script
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("playerName").placeholder = "Write name here";
});

// Initialize the skill chart
const ctx = document.getElementById('skillChart').getContext('2d');
let skillChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [
            'Shooting', 'Passing', 'Dribbling',
            'Defense', 'Rebounding', 'Speed',
            'Vertical', 'Stamina'
        ],
        datasets: [
            {
                label: 'Skill Caps',
                data: [], // Initialize with empty data; will set later
                backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                borderColor: 'yellow', 
                borderWidth: 1,
                barThickness: 70,
                categoryPercentage: 1, 
                barPercentage: 1, 
                order: 0
            },
            {
                label: 'Player Skill Ratings',
                data: [0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    'red', 'orange', 'purple', 'yellow',
                    'blue', 'white', 'aqua', 'lawngreen'
                ],
                borderColor: [
                    'rgba(0, 0, 0, 1)',
                    'rgba(0, 0, 0, 1)', 
                    'rgba(0, 0, 0, 1)', 
                    'rgba(0, 0, 0, 1)', 
                    'rgba(0, 0, 0, 1)', 
                    'rgba(0, 0, 0, 1)', 
                    'rgba(0, 0, 0, 1)', 
                    'rgba(0, 0, 0, 1)' 
                ],
                borderWidth: 1,
                barThickness: 70, 
                categoryPercentage: 1, 
                barPercentage: 1, 
                order: 1
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 99,
            },
            x: {
                stacked: true,
                ticks: {
                    font: {
                        size: 24
                    }
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

// Function to update the chart with skill ratings and caps
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

    // Get the skill caps based on position and height
    const position = document.getElementById('position').value;
    const height = document.getElementById('height').value;
    const skillCaps = getSkillCaps(position, height);

    // Iterate through inputs to calculate total points and check validity
    inputs.forEach(input => {
        const value = parseInt(input.number.value) || 0;
        input.slider.value = value; // Sync the slider with the number input
        totalPoints += value;

        // Immediate feedback: check individual skill values
        if (value < 0 || value > 99) {
            errorMessage = 'Each skill must be between 0 and 99.';
        }
        
        // Check against skill caps
        if (value > skillCaps[input.number.id.split('-')[0]]) {
            errorMessage = `${input.number.id.split('-')[0].charAt(0).toUpperCase() + input.number.id.split('-')[0].slice(1)} exceeds skill cap of ${skillCaps[input.number.id.split('-')[0]]}.`;
            input.number.value = skillCaps[input.number.id.split('-')[0]]; // Reset to cap
            input.slider.value = skillCaps[input.number.id.split('-')[0]]; // Sync slider to cap
        }
    });

    // Check for total points exceeding limit
    if (totalPoints > 400) {
        errorMessage = 'Total points must not exceed 400.';
    }

    document.getElementById('error').textContent = errorMessage;

    // If no errors, update the chart with new data
    if (!errorMessage) {
        skillChart.data.datasets[0].data = Object.values(skillCaps); // Set skill caps data
        skillChart.data.datasets[1].data = inputs.map(input => parseInt(input.number.value) || 0); // Set player skill ratings
        skillChart.update();
    }
}

// Update the chart whenever the position or height changes
document.getElementById('position').addEventListener('change', updateChart);
document.getElementById('height').addEventListener('change', updateChart);

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

// Base skill caps for different positions
const baseSkillCaps = {
    pg: { shooting: 85, passing: 90, dribbling: 88, defense: 75, rebounding: 60, speed: 88, vertical: 80, stamina: 85 },
    sg: { shooting: 90, passing: 80, dribbling: 83, defense: 78, rebounding: 65, speed: 85, vertical: 78, stamina: 85 },
    sf: { shooting: 79, passing: 80, dribbling: 75, defense: 82, rebounding: 80, speed: 73, vertical: 83, stamina: 85 },
    pf: { shooting: 70, passing: 72, dribbling: 70, defense: 86, rebounding: 85, speed: 68, vertical: 82, stamina: 85 },
    c: { shooting: 65, passing: 65, dribbling: 65, defense: 90, rebounding: 90, speed: 65, vertical: 85, stamina: 85 }
};

// Height scaling factors for adjusting skill caps
const heightScalingFactors = {
    "5'0": { rebounding: 0.8, speed: 1.2, shooting: 1.1, passing: 1.1, dribbling: 1.2, defense: 0.8, vertical: 0.8, stamina: 1 },
    "5'1": { rebounding: 0.85, speed: 1.2, shooting: 1.1, passing: 1.1, dribbling: 1.2, defense: 0.8, vertical: 0.85, stamina: 1 },
    "5'2": { rebounding: 0.85, speed: 1.15, shooting: 1.1, passing: 1.1, dribbling: 1.15, defense: 0.85, vertical: 0.85, stamina: 1 },
    "5'3": { rebounding: 0.85, speed: 1.15, shooting: 1.1, passing: 1.1, dribbling: 1.15, defense: 0.85, vertical: 0.85, stamina: 1 },
    "5'4": { rebounding: 0.85, speed: 1.15, shooting: 1.1, passing: 1.1, dribbling: 1.15, defense: 0.85, vertical: 0.85, stamina: 1 },
    "5'5": { rebounding: 0.85, speed: 1.1, shooting: 1.05, passing: 1.05, dribbling: 1.1, defense: 0.9, vertical: 0.9, stamina: 1 },
    "5'6": { rebounding: 0.85, speed: 1.1, shooting: 1.05, passing: 1.05, dribbling: 1.1, defense: 0.9, vertical: 0.9, stamina: 1 },
    "5'7": { rebounding: 0.85, speed: 1.1, shooting: 1.05, passing: 1.05, dribbling: 1.1, defense: 0.9, vertical: 0.9, stamina: 1 },
    "5'8": { rebounding: 0.9, speed: 1.1, shooting: 1.05, passing: 1.05, dribbling: 1.1, defense: 0.9, vertical: 0.95, stamina: 1 },
    "5'9": { rebounding: 0.9, speed: 1.1, shooting: 1.05, passing: 1.05, dribbling: 1.1, defense: 0.9, vertical: 0.95, stamina: 1 },
    "5'10": { rebounding: 0.9, speed: 1.1, shooting: 1.05, passing: 1.05, dribbling: 1.1, defense: 0.9, vertical: 0.95, stamina: 1 },
    "5'11": { rebounding: 0.95, speed: 1.1, shooting: 1.05, passing: 1.05, dribbling: 1.05, defense: 0.95, vertical: 0.95, stamina: 1 },
    "6'0": { rebounding: 0.95, speed: 1.1, shooting: 1.05, passing: 1.05, dribbling: 1.05, defense: 0.95, vertical: 0.95, stamina: 1 },
    "6'1": { rebounding: 1.0, speed: 1.0, shooting: 1.05, passing: 1.0, dribbling: 1.0, defense: 1.0, vertical: 1.0, stamina: 1 },
    "6'2": { rebounding: 1.0, speed: 1.0, shooting: 1.0, passing: 1.0, dribbling: 1.0, defense: 1.0, vertical: 1.0, stamina: 1 },
    "6'3": { rebounding: 1.05, speed: 0.95, shooting: 1.0, passing: 1.0, dribbling: 1.0, defense: 1.05, vertical: 1.0, stamina: 1 },
    "6'4": { rebounding: 1.05, speed: 0.95, shooting: 1.0, passing: 1.0, dribbling: 1.0, defense: 1.05, vertical: 1.0, stamina: 1 },
    "6'5": { rebounding: 1.1, speed: 0.9, shooting: 1.0, passing: 1.0, dribbling: 1.0, defense: 1.1, vertical: 1.0, stamina: 1 },
    "6'6": { rebounding: 1.1, speed: 0.9, shooting: 1.0, passing: 1.0, dribbling: 1.0, defense: 1.1, vertical: 1.0, stamina: 1 },
    "6'7": { rebounding: 1.15, speed: 0.85, shooting: 0.95, passing: 0.95, dribbling: 0.95, defense: 1.15, vertical: 1.1, stamina: 1 },
    "6'8": { rebounding: 1.15, speed: 0.85, shooting: 0.95, passing: 0.95, dribbling: 0.95, defense: 1.15, vertical: 1.1, stamina: 1 },
    "6'9": { rebounding: 1.2, speed: 0.8, shooting: 0.9, passing: 0.9, dribbling: 0.9, defense: 1.2, vertical: 1.2, stamina: 1 },
    "6'10": { rebounding: 1.2, speed: 0.8, shooting: 0.9, passing: 0.9, dribbling: 0.9, defense: 1.2, vertical: 1.2, stamina: 1 },
    "6'11": { rebounding: 1.25, speed: 0.75, shooting: 0.85, passing: 0.85, dribbling: 0.85, defense: 1.25, vertical: 1.3, stamina: 1 },
    "7'0": { rebounding: 1.25, speed: 0.75, shooting: 0.85, passing: 0.85, dribbling: 0.85, defense: 1.25, vertical: 1.3, stamina: 1 },
    "7'1": { rebounding: 1.3, speed: 0.7, shooting: 0.8, passing: 0.8, dribbling: 0.8, defense: 1.3, vertical: 1.4, stamina: 1 },
    "7'2": { rebounding: 1.3, speed: 0.7, shooting: 0.8, passing: 0.8, dribbling: 0.8, defense: 1.3, vertical: 1.4, stamina: 1 }
};

// Function to get skill caps based on player position and height
function getSkillCaps(position, height) {
    const caps = { ...baseSkillCaps[position] }; // Get the base skill caps
    const heightAdjustment = heightScalingFactors[height]; // Get the height adjustment factors

    // Adjust skill caps according to height
    for (const skill in caps) {
        caps[skill] = Math.min(99, Math.round(caps[skill] * heightAdjustment[skill])); // Ensure no skill exceeds 99
    }
    return caps; // Return the final adjusted caps
}

// Initial population of the skill caps in the chart
updateChart(); // Call the function to populate initial values

const form = document.getElementById("player-form")
const heightDiv = document.getElementById("heightOutput")
const nameDiv = document.getElementById("nameOutput")
const positionDiv = document.getElementById("positionOutput")

form.addEventListener('submit', function(event) {
    event.preventDefault();

    const height = document.getElementById("height").value
    const name = document.getElementById("playerName").value.toUpperCase()
    const position = document.getElementById("position").value.toUpperCase()

    form.style.display = 'none';
    heightDiv.textContent = height;
    heightDiv.style.display = 'flex';
    nameDiv.textContent = name;
    nameDiv.style.display = 'flex';
    positionDiv.textContent = position;
    positionDiv.style.display = 'flex';

})