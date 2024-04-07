import React from "react";
// import { useSpeechSynthesis } from "react-speech-kit";
import { Form } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Spell from "./Spell";

const Batch = (props) => {
    // const { speak, voices } = useSpeechSynthesis();
    const [ index, setIndex ] = React.useState(-1);
    const [ started, setStarted ] = React.useState(false);
    // const [ timers, setTimers ] = React.useState([]);
    // const [ progressTimer, setProgressTimer ] = React.useState();
    const [ correctWords, setCorrectWords ] = React.useState([]);
    const [ wordList, setWordList ] = React.useState({});
    const [ currentWord, setCurrentWord ] = React.useState(null); 
    // const speakSleep = 3000;

    // const speakWord = (index) => {
    //     // for(let j = 0; j < props.settings.repeatTime; j++) {
    //     //     timers.push(setTimeout(() => {
    //     //         // if (props.settings.voice === 0 || props.settings.voice) {
    //     //         //     speak({ text: props.words[index], voice: voices[props.settings.voice], rate: props.settings.rate ? props.settings.rate : "1"});
    //     //         // } else {
    //     //             speak({ text: props.words[index], rate: props.settings.rate ? props.settings.rate : "1"});
    //     //         // }
    //     //     }, speakSleep * j));
    //     // }
    // };

    // const stopSpeakWord = () =>{
    //     timers.forEach(timer => {clearTimeout(timer)});
    //     clearInterval(progressTimer);
    // };
    
    const nextClicked = () => {
        if (index >= props.words.length) {
            startClicked(false);
        } else {
            nextWord(currentWord, false, true);
            // stopSpeakWord();
            setIndex((prevIndex) => prevIndex + 1);
        }
    };

    const startClicked = (isStarted) => {
        setStarted(isStarted);

        if (!isStarted) {
            // stopSpeakWord();
            setIndex(-1);
            props.setYearStarted(props.year, props.batch, isStarted);
        } else {
            // nextClicked();
            initWords();
        }
    };;

    const setCorrectWord = (word, isCorrect, attemptCompleted) => {
        if (!isCorrect && !attemptCompleted) return;

        nextWord(word, isCorrect, attemptCompleted);

        // wordList[word].isCorrect = isCorrect;
        // wordList[word].start = false;
        // wordList[word].attempted = attemptCompleted;

        // let i = wordList[word].index + 1;
        // setCurrentWord(props.words[i]);

        // if (!props.words[i]) { 
        //     startClicked(false);
        // }

        setCorrectWord(props.words.filter((word) => wordList[word].isCorrect));
    };

    React.useEffect(() => {
        if (index < 0) return;
        // speakWord(index);
        // setCounter(-1);
        // setProgressBarColor("progress-bar-green");
        // setCountOfProgress(0);
    }, [index]);

    // const ReloadMessage = () => {
    //     setCountOfProgress((oldProgress) => {
    //         if (!started) return 0;
    //         if (counter >= props.settings.waitTime) {
    //             setCounter(-1);
    //             setIndex((prevIndex)=> prevIndex + 1);
    //             // setProgressBarColor("progress-bar-green");
    //         } else {
    //             setCounter((counter) => counter + 1);
    //         }
    //         let progress = counter/ props.settings.waitTime * 100;
    //         if (progress >= 50) {
    //             // setProgressBarColor(progress >= 75 ? "progress-bar-red" : "progress-bar-yellow");
    //         } else {
    //             // setProgressBarColor("progress-bar-green");
    //         }
    //         return counter/ props.settings.waitTime * 100;
    //     });
    // };

    React.useEffect(()=>{
        props.setYearStarted(props.year, props.batch, started);
        // if (started) {
        //     const tid = setInterval(ReloadMessage, 2000);
        //     return () => {
        //         clearInterval(tid);
        //     };
        // } else {
        //     setCorrectWords([]);
        // }
    // }, [started, counter]);
    }, [started]);

    const initWords = () => {
        let i = 0;
        props.words.forEach((word) => {
            wordList[word] = { 
                start: i === 0,
                attempted: false,
                isCorrect: false,
                index: i
            };
            i++;
        });
        console.log(props.words, wordList);
        setCurrentWord(props.words[0]);
    };

    const nextWord = (word, isCorrect, attemptCompleted) => {
        wordList[word].isCorrect = isCorrect;
        wordList[word].start = false;
        wordList[word].attempted = attemptCompleted;

        let i = wordList[word].index + 1;
        setCurrentWord(props.words[i]);

        if (!props.words[i]) { 
            startClicked(false);
        }
    };

    React.useEffect(() => {
        if (Object.keys(wordList).length > 0) return;

        setCorrectWords([]);
        initWords();
    }, [props.words]);

    return (
        <>
            {   
                started ?
                    <>
                        {
                            correctWords.map((word) => {
                                return <Form.Label className="word-tested word" key={word}>{word}</Form.Label> 
                            })
                        }
                        <Spell word={currentWord} settings={props.settings} setCorrectWord={setCorrectWord}/>
                        <Button className="button bg-info"  onClick={() => {startClicked(false)}}>Stop</Button>
                        <Button className="button bg-info"  onClick={() => {nextClicked()}}>Next</Button> 
                    </>
                : 
                   <Button className="button bg-info"  onClick={() => {startClicked(true)}}>Start</Button>
            }
        </>
    );
};
export default Batch;