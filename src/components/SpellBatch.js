import React from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import { Form } from "react-bootstrap";
import ProgressBar from 'react-bootstrap/ProgressBar';
import Button from 'react-bootstrap/Button';
import SpellTest from "./SpellTest";

const SpellBatch = (props) => {
    const { speak, voices } = useSpeechSynthesis();
    const [ index, setIndex ] = React.useState(-1);
    const [ started, setStarted ] = React.useState(false);
    const [ timers, setTimers ] = React.useState([]);
    const [ progressTimer, setProgressTimer ] = React.useState();
    const [ progressBarColor, setProgressBarColor] = React.useState("progress-bar-green");
    const [ countOfProgess, setCountOfProgess ] = React.useState(0);
    const [ counter, setCounter ] = React.useState(0);
    const [ correctWords, setCorrectWords ] = React.useState([]);
    const speakSleep = 3000;

    const speakWord = (index) => {
        for(let j = 0; j < props.settings.repeatTime; j++) {
            timers.push(setTimeout(() => {
                speak({ text: props.words[index], voice: voices[props.settings.voice], rate: props.settings.rate ? props.settings.rate : "1"});
            }, speakSleep * j));
        }
    };

    const stopSpeakWord = () =>{
        timers.forEach(timer => {clearTimeout(timer)});
        clearInterval(progressTimer);
    }

    const startClicked = (isStarted) => {
        if (!isStarted) {
            stopSpeakWord();
            setIndex(-1);
        } else {
            setIndex(0);
        }
        setStarted(isStarted);
    };

    const setCorrectWord = (word, isCorrect) => {
        props.setCorrectWord(word, isCorrect);
        if (isCorrect && !correctWords.includes(word)) {
            correctWords.push(word);
            setIndex((index) => index + 1);
        }
    };

    React.useEffect(() => {
        if (index < 0) return;
        speakWord(index);
        setCounter(-1);
        setProgressBarColor("progress-bar-green");
        setCountOfProgess(0);
    }, [index]);

    const ReloadMessage = () => {
        setCountOfProgess((oldProgress) => {
            if (!started) return 0;
            if (counter === props.settings.waitTime) {
                setCounter(-1);
                setIndex((prevIndex)=> prevIndex + 1);
                setProgressBarColor("progress-bar-green");
            } else {
                setCounter((counter) => counter + 1);
            }
            let progress = counter/ props.settings.waitTime * 100;
            if (progress >= 50) {
                setProgressBarColor(progress >= 75 ? "progress-bar-red" : "progress-bar-yellow");
            } else {
                setProgressBarColor("progress-bar-green");
            }
            return counter/ props.settings.waitTime * 100;
        });
    };

    React.useEffect(()=>{
        const tid = setInterval(ReloadMessage, 2000);

        return () => {
            clearInterval(tid);
        };
    }, [started, counter]);

    React.useEffect(() => {
        console.log("started:", started, props.year, props.batch);
        props.setYearStarted(props.year, props.batch, started);
    }, [started]);

    React.useEffect(() => {
       setCorrectWord([]);
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
                        <ProgressBar className={progressBarColor} now={countOfProgess} />
                        <SpellTest word={props.words[index]} voice={props.voice} settings={props.settings} setCorrectWord={setCorrectWord}/>
                        <Button className="button bg-info"  onClick={() => {startClicked(false)}}>Stop</Button>
                        <Button className="button bg-info"  onClick={() => setIndex((prevIndex) => prevIndex + 1)}>Next</Button> 
                    </>
                : 
                   <Button className="button bg-info"  onClick={() => {startClicked(true)}}>Start</Button>
            }
        </>
    );
};
export default SpellBatch;