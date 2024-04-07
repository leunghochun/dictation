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

        if (correct && text.length === props.word.length) {
            props.setCorrectWord(props.word, correct);
            stopSpeakWord();
        } else {
            setPlaceHolder(correct ? "Please input next character" : `"${char}" is wrong`);
            setWord(correctChars.join(""));
            setKey("");
            if (!correct) setAttempt((attempt) => attempt + 1);
        }
    };

    const speakWord = () => {
        for(let j = 0; j < props.settings.repeatTime; j++) {
            let timer = setTimeout(() => {
                speak({ text: props.word, rate: props.settings.rate ? props.settings.rate : "1"});
            }, speakSleep * j);
            timers.push(timer);

            // return () => {
            //     clearTimeout(timer);
            // }
            // timers.push(setTimeout(() => {
            //     speak({ text: props.word, rate: props.settings.rate ? props.settings.rate : "1"});
            // }, speakSleep * j));

            // // return () => {
            // //     stopSpeakWord();
            // // }
        }
    };
            
    const stopSpeakWord = () =>{
        console.log("stopSpeakWord");
        timers.forEach(timer => {clearTimeout(timer)});
    };

    React.useEffect(() => {
        if (attempt >= props.settings.numberOfAttempt) {
            props.setCorrectWord(props.word, false /* isCorrect */, true /* attempt completed */ );
            stopSpeakWord();
        }
    }, [attempt]);

    React.useEffect(() => {
        setWord("");
        setKey("");
        setAttempt(0);
        setCountOfProgress(0);
        setIsCorrect(false);
        setCountOfProgress(0);
        setCounter(0);
        console.log(props.word);
    }, [props.word])
    
    const GetProgressBarColor = () => {
        // determine the color of progress bar
        let progress = counter/ props.settings.waitTime * 100;
        if (progress >= 50) {
            return progress >= 75 ? "progress-bar-red" : "progress-bar-yellow";
        } else {
            return "progress-bar-green";
        }
    }

    React.useEffect(() => {
        const timeeout = setTimeout(() => {
            setCounter(counter + 1);
            if (counter === 0) {
                speakWord(); 
            } else if (counter >= 10) {
                props.setCorrectWord(props.word, false /* isCorrect */, true /* attempt completed */ );
                clearTimeout(timeeout);
            }
        }, 1000)
        
        return () => {
            clearTimeout(timeeout);
            // stopSpeakWord();
        };
    }, [counter, speak]);

    React.useEffect(() => {
        return () => {
            console.log("timers");
            stopSpeakWord();
        };
    }, [timers]);

    return (
        <>
            <div>Progress: {countOfProgress}, attempt: {attempt}, word: {props.word} </div>
            <ProgressBar className={GetProgressBarColor()} now={counter / props.settings.waitTime * 100} />
            <Form.Label className="word-tested word" key={props.word}>{word}</Form.Label> 
            <Form.Control size="lg" type="text" placeholder={placeHolder} onChange={inputKeyUp} value={key}/>
        </>
    );
};
export default Spell;