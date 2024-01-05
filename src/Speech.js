import React, { useEffect } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import ProgressBar from 'react-bootstrap/ProgressBar';
import ListGroup from 'react-bootstrap/ListGroup';
import wordsJSON from "./words.json";

const Speech = () => {
    const { speak, voices } = useSpeechSynthesis();
    const [voice, setVoice] = React.useState(0);
    const [wordData, setWordData] = React.useState(wordsJSON);
    const [wordList, setWordList] = React.useState({});
    const [wordTested, setWordTested] = React.useState([]);
    const [waitTime, setWaitTime] = React.useState(10);
    const [repeatTime, setRepeatTime] = React.useState(2);
    const [numberOfWord, setNumberOfWord] = React.useState(20);
    const [progress, setProgress] = React.useState(0);
    const [selectedGroup, setSelectedGroup] = React.useState("");
    const [timers, setTimers] = React.useState([]);
    const voiceNames = ['Samantha', 'Aaron', 'Daniel (English (United Kingdom))'];

    const getVoices = () => {
        let list = [];
        voices.forEach((voice, index) => {
            console.log(voice, index);
            // if (voiceNames.includes(voice.name)){
            if (voice.lang === "en-US" || voice.lang === "en-GB") {
                list.push({ name: voice.name, value: index})
            }
        });
        return list;
    }
    const voiceList = getVoices();
    // console.log(voices.filter((voice) => voice.lang === "en-US"));

    const start = async (batch) => {
        let wordsToBeTested = Object.keys(wordList[batch]);
        wordsToBeTested.map(async (key, i) => {
            timers.push(setTimeout(() => {
                    for(let j = 0; j<repeatTime; j++) {
                        setTimeout(() => {
                            // speak({ text: key });
                            speak({ text: key, voice: voices[voice]});
                            console.log("speak: " + key + " " + new Date().toLocaleTimeString());
                        }, 2000 * j);
                    }
                    wordTested.push(key);
                    wordList[batch][key] = true;
                }, waitTime * 1000 * i)
            );
        })
    }

    const stop = () => {
       setProgress(0);
       timers.forEach(timer => {clearTimeout(timer)});
    }
    
    const waitTimeSliderChange = (e) => {
        setWaitTime(e.target.value);
    };

    const repeatSliderChange = (e) => {
        setRepeatTime(e.target.value);
    };
    
    const numberOfWordSliderChange = (e) => {
        setNumberOfWord(e.target.value);
    }
    
    const printWord = (word) => {
        return <Form.Label className="word" key={word}>{wordList[word] ? word: ""}</Form.Label> 
    }

    const batchSelected = (batch) => {
        setSelectedGroup(batch);
    }

    const voiceChanged = (selectedVoice) => {
        setVoice(selectedVoice);
    }

    const generateWordList = (data) => {
        if (!data) return;
        setWordList((oldWordList) => {
                let newWordList = {};
                let isNew = Object.keys(oldWordList).length === 0;
                // oldWordList = {};
                for (let year in data) {
                    let array = [...data[year].words].sort(() => Math.random() - 0.5);
                    let i = 1;
                    while (array.length > 0) {
                        let key = i.toString();
                        newWordList[year + "Batch" + key] = {};
                        let batch = array.splice(0, numberOfWord);
                        batch.forEach((word) => {
                            newWordList[year + "Batch" + key][word] = wordTested.includes(word);
                        })
                        //     if (isNew || !oldWordList[year + "Batch" + key][word]) {
                        //     }
                        // });

                        // array.splice(0, numberOfWord).forEach((word) => {
                        //     if (isNew || !oldWordList[year + "Batch" + key][word]) {
                        //         newWordList[year + "Batch" + key][word] = wordTested.includes(word);
                        //     }
                        // });
                        i++;
                    }
                }
                setSelectedGroup(Object.keys(newWordList)[0]);
                console.log(newWordList);
                return newWordList;
        });
    }
    useEffect(() => {
        generateWordList(wordData);
    }, [wordData, numberOfWord])

    return (        
        <Accordion defaultActiveKey={['1']} alwaysOpen>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Settings</Accordion.Header>
                <Accordion.Body>
                    <Form.Label>Wait time ({waitTime} seconds)</Form.Label>
                    <Form.Range value={waitTime} onChange={waitTimeSliderChange} min="5" max="30" />
                    <Form.Label>Repeat ({repeatTime} X)</Form.Label>
                    <Form.Range value={repeatTime} onChange={repeatSliderChange} min="1" max="3" />
                    <Form.Label>Number of words({numberOfWord})</Form.Label>
                    <Form.Range value={numberOfWord} onChange={numberOfWordSliderChange} min="5" max="30" step="5" />
                    <Form.Label>Voice</Form.Label>
                    
                    {voiceList.map((item) => {
                        return <div className="flexLayout">
                                <Form.Check key={"voice" + item.name + item.value} value={item.value} type="radio" label={item.name} onChange={() => voiceChanged(item.value)} checked={item.value === voice} />
                                <Button className="linkButton" variant="link" onClick={() => { speak({text: item.name, voice: voices[item.value] }) }}>Test</Button>
                            </div>
                        })
                    }
                </Accordion.Body> 
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header>Batches</Accordion.Header>
                <Accordion.Body>
                    <ListGroup activeKey={"#" + selectedGroup}>
                        {Object.keys(wordList).map((batch) => {
                            return (
                                <ListGroup.Item key={batch} action href={"#" + batch} onClick={() => batchSelected(batch)}>
                                    {Object.keys(wordList[batch]).map((word) => {
                                        return <Form.Label className={wordList[batch][word] ? "word word-tested": "word"} key={word} >{word} </Form.Label>
                                    })}
                                    <br/>
                                    <Button className="button bg-info" onClick={() => start(batch)}> Start </Button>
                                </ListGroup.Item>
                            )
                        })}
                    </ListGroup>
                </Accordion.Body> 
            </Accordion.Item>
            <Accordion.Item eventKey="2">
                <Accordion.Header>Words</Accordion.Header>
                <Accordion.Body>
                    <div className="flex-container">
                        {Object.keys(wordList).map((word) => printWord(word))}
                        <div className="flex-full-width">
                            <Button className="button" onClick={() => start()}> Start </Button>
                            <Button className="button" onClick={() => stop()}> Stop </Button>
                        </div>
                    </div>
                </Accordion.Body> 
            </Accordion.Item>
        </Accordion>
    );
};
export default Speech;