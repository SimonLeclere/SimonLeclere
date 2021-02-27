const fs = require('fs')
const template = require('lodash.template');
const fetch = require('node-fetch');

const UserData = {
    title: "quiz|2459|Green Arrow",
    user: "Simon Leclère"
}

const answerData = UserData.title.split('|');

const makeLeaderboard = (leaderboard) => leaderboard.sort((a, b) => b.wins - a.wins).slice(0, 10);
const isCorrect = async (id, userAnswer) => {
    const question = await fetchQuestion(id);
    return [question.correct_answer.toLowerCase() === userAnswer.toLowerCase(), question.question];
}
const genLink = (id, answer) => encodeURI(`https://github.com/SimonLeclere/SimonLeclere/issues/new?title=quiz|${id}|${answer}&body=Just+click+%27Submit+new+issue%27.`);
const fetchQuestion = async (id='') => {
    return await fetch(`https://beta-trivia.bongo.best/${id}`)
    .then(res => res.json())
    .then(res => res[0]);
};



const previousData = require('../data.json');

fs.readFile('readme.template.md', async (err, data) => {

	if (err) return console.error(err);
	const readme = data.toString();
    
    const triviaData = await fetchQuestion();

    const answersList = [...triviaData.incorrect_answers, triviaData.correct_answer];
    const lastQuestion = await isCorrect(answerData[1], answerData[2]);

    previousData.lastAnswers = previousData.lastAnswers.slice(0, 9);
    previousData.lastAnswers.push({
        name: UserData.user,
        answer: answerData[2],
        question: lastQuestion[1],
        correct: lastQuestion[0]
    });

    const lastAnswers = previousData.lastAnswers.map(a => `- **${a.name}** answered **${a.answer}** to \`${a.question}\` (${a.correct ? 'Good answer' : 'Bad answer'})`);

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
        leaderboard: makeLeaderboard(previousData.leaderboard).map(x => `| ${x.name} | ${x.wins} |`).join('\n')
    });

    fs.writeFile('READMEE.md', final, (err) => {
        if(err) return console.log(err);
        console.log('Readme updated!')
    });

    fs.writeFile('data.json', JSON.stringify(previousData), (err) => {
        if(err) return console.log(err);
        console.log('data.json updated!')
    });
})