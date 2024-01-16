import React from "react";
import Form from 'react-bootstrap/Form'

const SpellTest = (props) => {
    const [ speaked, setSpeaked] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);

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