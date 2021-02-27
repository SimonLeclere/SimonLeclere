const core = require('@actions/core');
const user = core.getInput('user');

try {

    const userData = {};

    const data = require('../data.json');

    const rank = `${data.leaderboard.filter(u => u.wins > data.leaderboard.find(x => x.name === user).wins).length + 1}`;
    const suffixes = { '1': 'st', '2': 'nd', '3': 'rd' };
    userData.rank = `${rank}${suffixes[rank[rank.length - 1]] || 'th'}`;

    userData.correctAnswers = data.leaderboard.filter(u => u.name === user).wins;

    core.setOutput('closeIssueMsg', `Here are your statistics:\n\n    - Correct answers: ${userData.correctAnswers}\n    - Rank: ${userData.rank}`);

} catch(error) {
    core.setFailed(error.message);
}