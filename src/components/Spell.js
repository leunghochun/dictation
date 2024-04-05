import React from "react";
import Form from 'react-bootstrap/Form'
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useSpeechSynthesis } from "react-speech-kit";

const Spell = (props) => {
    const { speak } = useSpeechSynthesis();
    const [ timers, setTimers ] = React.useState([]);

    const [ placeHolder, setPlaceHolder] = React.useState("Please input character");
    const [ key, setKey] = React.useState("");
    const [ word, setWord] = React.useState("");
    const [ attempt, setAttempt] = React.useState(0);
    const [ isCorrect, setIsCorrect ] = React.useState(false);

    const [ progressBarColor, setProgressBarColor] = React.useState("progress-bar-green");
    const [ countOfProgress, setCountOfProgress ] = React.useState(0);
    const [ counter, setCounter ] = React.useState(0);

    const speakSleep = 3000;

    const inputKeyUp = (event) =>{
        if (!props.word) return;

        if (event.keyCode === 8) {
            setWord((word) => word.substring(0, word.length-1));
            return;
        }
        let char = event.target.value;
        let text = word + char;
        let correctChars = [];
        let correct = true;
        for (let i = 0; i < text.length; i++) {
            if (text[i].toLowerCase() === props.word[i].toLowerCase()) {
                correctChars.push(text[i]);
            }
            else {
                correct = false;
                break;
            }
        }
        setIsCorrect(correct && text.length === props.word.length);
        setWord(correctChars.join(""));
        setPlaceHolder(correct ? "Please input next character" : `"${char}" is wrong`);
        setKey("");
        setAttempt((attempt) => attempt + 1);
        console.log(attempt, word);
    };

    const speakWord = () => {
        for(let j = 0; j < props.settings.repeatTime; j++) {
            timers.push(setTimeout(() => {
                speak({ text: props.word, rate: props.settings.rate ? props.settings.rate : "1"});
            }, speakSleep * j));
        }
    };
            
    const stopSpeakWord = () =>{
        timers.forEach(timer => {clearTimeout(timer)});
    };

    React.useEffect(()=> {
        if (props.word) {
            props.setCorrectWord(props.word, isCorrect);
            setWord("");
        }
    }, [isCorrect, props]);

    React.useEffect(() => {
        setWord("");
    }, [props.word])

    const GetProgressBarColor = () => {
        // determine the color of progress bar
        let progress = counter/ props.settings.waitTime * 100;
        if (progress >= 50) {
            // return setProgressBarColor(progress >= 75 ? "progress-bar-red" : "progress-bar-yellow");
            return progress >= 75 ? "progress-bar-red" : "progress-bar-yellow";
        } else {
            return "progress-bar-green";
        }
    }

    React.useEffect(() => {
        const timeeout = setTimeout(() => {
            setCounter(counter + 1);
            // console.log(counter);
            if (counter === 0) speakWord();
        }, 1000)
        
        console.log(counter);
        if (counter >= 10) {
            clearTimeout(timeeout);
        }
        return () => {
            clearTimeout(timeeout);
        };
    }, [counter, speak]);

    return (
        <>
            {
                props.start 
                ?
                    <>
                        <div>Progress: {countOfProgress}</div>
                        {/* <ProgressBar className={progressBarColor} now={countOfProgress} /> */}
                        <ProgressBar className={GetProgressBarColor()} now={counter / props.settings.waitTime * 100} />
                        <Form.Label className="word-tested word" key={props.word}>{word}</Form.Label> 
                        <Form.Control size="lg" type="text" placeholder={placeHolder} onChange={inputKeyUp} value={key}/>
                    </>
                :
                    <></>
            }
        </>
    );
};
export default Spell;