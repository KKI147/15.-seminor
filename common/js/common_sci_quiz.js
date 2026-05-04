var quizCon1, quizCon2, quizCon3, quizCon4, quizCon5, quizCon6, quizCon7, quizCon8, quizCon9;

// quizCon1, quizCon2, ... , quizCon9까지 리셋
function resetQuizAll() {
    let koQuiz;
    for (let i = 1; i <= 9; ++i) {
        koQuiz = eval('quizCon' + i);
        if (koQuiz && typeof (koQuiz) !== 'undefined') {
            koQuiz.reset();
        }
    }
}
