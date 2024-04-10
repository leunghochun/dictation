import React from "react";
import Form from 'react-bootstrap/Form'
import ProgressBar from 'react-bootstrap/ProgressBar';
import Collapse from 'react-bootstrap/Collapse';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

// import { useSpeechSynthesis } from "react-speech-kit";

const Spell = (props) => {
    // const { speak } = useSpeechSynthesis();

    const [ placeHolder, setPlaceHolder] = React.useState("Please input character");
    const [ key, setKey] = React.useState("");
    const [ word, setWord] = React.useState("");
    const [ attempt, setAttempt] = React.useState(0);
    const [ isCorrect, setIsCorrect ] = React.useState(false);
    const [ open, setOpen] = React.useState(false);

    const [ countOfProgress, setCountOfProgress ] = React.useState(0);
    const [ counter, setCounter ] = React.useState(0);
    const [ speakCount, setSpeakCount] = React.useState(0);

    const speakInterval = 3;

    const speakIt = (isCountAttempt) => {
        props.speak({ text: props.word, rate: props.settings.rate ? props.settings.rate : "1"});
        if (isCountAttempt) { 
            setAttempt(attempt + 1);
        }
    };

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
            props.setCorrectWord(props.word, correct, true /* attempted */);
        } else {
            setPlaceHolder(correct ? "Please input next character" : `"${char}" is wrong`);
            setWord(correctChars.join(""));
            setKey("");
            if (!correct) setAttempt((attempt) => attempt + 1);
        }
    };

    React.useEffect(() => {
        if (attempt >= props.settings.numberOfAttempt) {
            props.setCorrectWord(props.word, false /* isCorrect */, true /* attempt completed */ );
        }
    }, [attempt, props]);

    React.useEffect(() => {
        setWord("");
        setKey("");
        setAttempt(0);
        setCountOfProgress(0);
        setIsCorrect(false);
        setCountOfProgress(0);
        setCounter(0);
        setSpeakCount(0);
        setOpen(true);
    }, [props.word])
    
    const GetProgressBarColor = () => {
        // determine the color of progress bar
        let progress = counter / props.settings.waitTime * 100;
        if (progress >= 50) {
            return progress >= 75 ? "progress-bar-red" : "progress-bar-yellow";
        } else {
            return "progress-bar-green";
        }
    }

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setCounter(counter + 1);
            if (counter % speakInterval === 0 && speakCount < props.settings.repeatTime) {
                    speakIt(false);
                    setSpeakCount(speak => speak + 1);    
            } else if (counter >= props.settings.waitTime) {
                props.setCorrectWord(props.word, false /* isCorrect */, true /* attempt completed */ );
                clearTimeout(timeout);
            }
        }, 1000)
        
        return () => {
            clearTimeout(timeout);
        };
    }, [counter, props, speakCount, speakIt]);

    return (
        <Collapse in={open} dimension="width">
            <Card body style={{ width: "100vw" }}>
                <ProgressBar className={GetProgressBarColor()} now={counter / props.settings.waitTime * 100} />
                <Form.Label className="word-tested word" key={props.word}>{word}</Form.Label> 
                <Form.Control size="lg" type="text" placeholder={placeHolder} onChange={inputKeyUp} value={key}/>
                <dov>No of Attempt left: { props.settings.numberOfAttempt - attempt } </dov>
                <Button className="button bg-info"  onClick={() => {speakIt(true)}}>Speak</Button>
            </Card>
        </Collapse>
    );
};
export default Spell;