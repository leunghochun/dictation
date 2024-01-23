import React from "react";
import Form from 'react-bootstrap/Form'

const SpellTest = (props) => {
    const [ key, setKey] = React.useState("");
    const [ word, setWord] = React.useState("");
    const [ isCorrect, setIsCorrect ] = React.useState(false);

    const inputKeyUp = (event) =>{
        console.log(event.target.value);
        if (event.keyCode === 8) {
            setWord((word) => word.substring(0, word.length-1));
            return;
        }
        let char = event.target.value;
        let text = word + char;
        console.log(char, text);
        let correctChars = [];
        let correct = true;
        for (let i = 0; i < text.length; i++) {
            if (text[i].toLowerCase() === props.word[i].toLowerCase())
                correctChars.push(text[i]);
            else {
                correct = false;
                break;
            }
        }
        console.log("correct:", correct, correct && text.length === props.word.length);
        setIsCorrect(correct && text.length === props.word.length);
        setWord(text);
        setKey("");
    };

    React.useEffect(()=> {
        if (props.word) {
            props.setCorrectWord(props.word, isCorrect);
            setWord("");
        }
        console.log("isCorrect Effect:", isCorrect);
    }, [isCorrect]);

    React.useEffect(() => {
        setWord("");
        console.log("props.word", props.word);
    }, [props.word])

    return (
        <>
            {isCorrect ? props.word : ""}
            <Form.Label className="word-tested word" key={word}>{word}</Form.Label> 
            <Form.Control size="lg" type="text" placeholder="Vocabulary" onKeyUp={inputKeyUp} onChange={inputKeyUp} value={key}/>
        </>
    );
};
export default SpellTest;