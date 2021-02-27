const fs = require('fs')
const template = require('lodash.template');
var unescape = require('lodash.unescape');
const fetch = require('node-fetch');
const core = require('@actions/core');

const UserData = {
    title: core.getInput('title'),
    user: core.getInput('user')
}

const answerData = UserData.title.split('|');

const makeLeaderboard = (leaderboard) => leaderboard.sort((a, b) => b.wins - a.wins).slice(0, 10);
const shuffle = arr => arr.sort(() => 0.5 - Math.random());
const isCorrect = async (id, userAnswer) => {
    const question = await fetchQuestion(id);
    return [question.correct_answer.toLowerCase() === userAnswer.toLowerCase(), question.question, question.correct_answer];
}
const genLink = (id, answer) => encodeURI(`https://github.com/SimonLeclere/SimonLeclere/issues/new?title=quiz|${id}|${answer}&body=Just click 'Submit new issue'.`);
const fetchQuestion = async (id='') => {
    return await fetch(`https://beta-trivia.bongo.best/${id}`)
    .then(res => res.json())
    .then(res => res[0]);
};


try {
    const previousData = require('../data.json');

    fs.readFile('readme.template.md', async (err, data) => {

        if (err) return console.error(err);
        const readme = data.toString();
        
        const triviaData = await fetchQuestion();

        const answersList = shuffle([...triviaData.incorrect_answers, triviaData.correct_answer]);
        const lastQuestion = await isCorrect(answerData[1], answerData[2]);

        previousData.lastAnswers = previousData.lastAnswers.slice(0, 9);
        previousData.lastAnswers.unshift({
            name: UserData.user,
            answer: answerData[2],
            question: unescape(lastQuestion[1]),
            correct: lastQuestion[0]
        });

        const lastAnswers = previousData.lastAnswers.map(a => `- **${a.name}** answered **${a.answer}** to \`${a.question}\` (${a.correct ? 'Good answer' : 'Wrong answer'})`);

        if(lastQuestion[0]) {
            const userScore = previousData.leaderboard.find(l => l.name === UserData.user);
            if(userScore) userScore.wins++;
            else previousData.leaderboard.push({ name: UserData.user, wins: 1 })
        }

        const templated = template(readme);
        const final = templated({
            question: triviaData.question,
            answers: `| ${answersList.map(a => `[${a}](${genLink(triviaData.id, a)})`).join(' | ')} |` + '\n' + `| ${ '- | '.repeat(answersList.length)}`,
            lastAnswers: lastAnswers.join('\n'),
            leaderboard: makeLeaderboard(previousData.leaderboard).map(x => `| [${x.name}](https://github.com/${x.name}) | ${x.wins} |`).join('\n')
        });

        const suffixes = { '1': 'st', '2': 'nd', '3': 'rd' };
        const rank = `${previousData.leaderboard.filter(u => u.wins >= previousData.leaderboard.find(x => x.name === UserData.user)).length + 1}`;
        const victoryString = `Hey ${UserData.user}, like you said, the correct answer was "${lastQuestion[2]}"! Congratulations!\n\nYour rank on the leaderboard: ${rank}${suffixes[rank[rank.lenght]] || 'th'}`;
        const lostString = `Hey ${UserData.user}, unfortunately you were wrong, the correct answer was "${lastQuestion[2]}"! Don't worry, next time will be the right one!\n\nYour rank on the leaderboard: ${rank}${suffixes[rank[rank.lenght]] || 'th'}`;
        core.setOutput('closeIssueMsg', lastQuestion[0] ? victoryString : lostString);

        fs.writeFile('README.md', final, (err) => {
            if(err) return console.log(err);
            console.log('Readme updated!')
        });

        fs.writeFile('data.json', JSON.stringify(previousData), (err) => {
            if(err) return console.log(err);
            console.log('data.json updated!')
        });
    })

} catch(error) {
    core.setFailed(error.message);
}