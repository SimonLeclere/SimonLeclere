const core = require('@actions/core');
const user = core.getInput('user');

try {

    const userData = {};

    const data = require('../data.json');

    const rank = data.leaderboard.filter(u => u.wins > data.leaderboard.find(x => x.name === user).wins).length + 1;
    const suffixes = { '1': 'st', '2': 'nd', '3': 'rd' };
    userData.rank = `${rank(UserData.user)}${suffixes[rank[rank.lenght]] || 'th'}`;

    userData.correctAnswers = data.leaderboard.filter(u => u.name === user).length + 1;

    core.setOutput('closeIssueMsg', `Here are your statistics:\n\n    - Correct answers: ${userData.correctAnswers}\n    - Rank: ${userData.rank}`);

} catch(error) {
    core.setFailed(error.message);
}