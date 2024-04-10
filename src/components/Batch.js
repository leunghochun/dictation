import React from "react";
import { Form } from "react-bootstrap";
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

import Spell from "./Spell";

const Batch = (props) => {
    const [ index, setIndex ] = React.useState(-1);
    const [ started, setStarted ] = React.useState(false);
    const [ correctWords, setCorrectWords ] = React.useState([]);
    const [ wordList, setWordList ] = React.useState({});
    const [ currentWord, setCurrentWord ] = React.useState(null); 

    const nextClicked = () => {
        if (index >= props.words.length) {
            startClicked(false);
        } else {
            nextWord(currentWord, false, true);
            setIndex((prevIndex) => prevIndex + 1);
        }
    };

    const startClicked = (isStarted) => {
        setStarted(isStarted);
        props.setYearStarted(props.year, props.batch, isStarted);

        if (!isStarted) {
            setIndex(-1);
        } else {
            initWords();
        }
    };;

    const setCorrectWord = (word, isCorrect, attemptCompleted) => {
        if (!isCorrect && !attemptCompleted) return;

        nextWord(word, isCorrect, attemptCompleted);

        setCorrectWords(props.words.filter((word) => wordList[word].isCorrect));
        props.setCorrectWord(word, isCorrect, props.year, props.batch);
    };

    React.useEffect(() => {
        if (index < 0) return;
    }, [index]);

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
        setCorrectWords([]);
        initWords();
    }, [props.words]);

    return (
        <>
            <Badge bg="success" pill>{ Object.keys(wordList).filter((word) => wordList[word].isCorrect ).length}</Badge>
            {   
                started && props.isShow ?
                    <>
                        {
                            Object.keys(wordList).filter((word) => wordList[word].attempted).map((word) => {
                                return <Form.Label className={`word-tested-${wordList[word].isCorrect ? "correct" : "incorrect"} word`} key={word}>{word}</Form.Label> 
                            })
                        }
                        <Spell word={currentWord} settings={props.settings} setCorrectWord={setCorrectWord}/>
                        <Button className="button bg-info"  onClick={() => {startClicked(false)}}>Stop</Button>
                        <Button className="button bg-info"  onClick={() => {nextClicked()}}>Next</Button> 
                    </>
                : 
                    <>
                        {
                            props.words.map((word) => {
                                return <Form.Label className="word" key={word}>{word}</Form.Label> 
                            })
                        }
                        <Button className="button bg-info"  onClick={() => {startClicked(true)}}>Start</Button>
                    </>
            }
        </>
    );
};
export default Batch;