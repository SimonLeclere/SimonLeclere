const core = require('@actions/core');
const userID = core.getInput('userID');
const user = core.getInput('user');

try {

    const userData = {};

    const data = require('../data.json');

    const userLeaderboard = data.leaderboard.find(x => x.userID === userID);
    if(!userLeaderboard) return core.setOutput('closeIssueMsg', `Hey, ${user}, it seems that you have never played before, so you don't have any statistics. Start by answering a question ;)`);

    const rank = `${data.leaderboard.filter(u => u.wins > userLeaderboard.wins).length + 1}`;
    const suffixes = { '1': 'st', '2': 'nd', '3': 'rd' };
    userData.rank = `${rank}${suffixes[rank[rank.length - 1]] || 'th'}`;

    core.setOutput('closeIssueMsg', `Here are your statistics:\n\n    - Correct answers: ${userLeaderboard.wins}\n    - Rank: ${userData.rank}`);

} catch(error) {
    core.setFailed(error.message);
}