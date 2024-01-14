import React from "react";
import Form from 'react-bootstrap/Form'
import { useSpeechSynthesis } from "react-speech-kit";

const SpellTest = (props) => {
    const { speak, voices } = useSpeechSynthesis();
    const [ speaked, setSpeaked] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);
    const speakSleep = 3000;

    const inputKeyUp = (event) =>{
        let text = event.target.value;
        let correctChars = [];
        let isCorrect = true;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === props.word[i])
                correctChars.push(text[i]);
            else {
                isCorrect = false;
                break;
            }
        }
        setIsCorrect(isCorrect && text.length === props.word.length);
    }

    React.useEffect(() => {
        // Some initialization logic here
        console.log("init", props.word, speaked);
        if (!props.word) return ;
        // if (!speaked) setSpeaked(true);
        setIsCorrect(false);
        for(let j = 0; j < props.settings.repeatTime; j++) {
            setTimeout(() => {
                // console.log(props.word);
                // props.setCorrectWord(props.word, true/*isCorrect*/);
                speak({ text: props.word, voice: voices[props.voice]});
            }, speakSleep * j);
        }
    }, [props.word]);

    React.useEffect(()=> {
        if (props.word)
            props.setCorrectWord(props.word, isCorrect);
    },[isCorrect]);

    return (
        <>
            {isCorrect ? props.word : ""}
            <Form.Control size="lg" type="text" placeholder="Vocabulary" onKeyUp={inputKeyUp}/>
        </>
    );
};
export default SpellTest;