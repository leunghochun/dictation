import React, { useEffect } from "react";
import { useSpeechSynthesis } from "react-speech-kit";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ListGroup from 'react-bootstrap/ListGroup';
import wordsJSON from "./words.json";

const Speech = () => {
    const { speak, voices } = useSpeechSynthesis();
    const [voice, setVoice] = React.useState(0);
    const [wordData, setWordData] = React.useState(wordsJSON);
    const [wordList, setWordList] = React.useState({});
    const [wordTested, setWordTested] = React.useState({});
    const [waitTime, setWaitTime] = React.useState(10);
    const [repeatTime, setRepeatTime] = React.useState(2);
    const [numberOfWord, setNumberOfWord] = React.useState(20);
    const [selectedGroup, setSelectedGroup] = React.useState("");
    const [timers, setTimers] = React.useState([]);
    const voiceNames = ['Samantha', 'Aaron', 'Daniel (English (United Kingdom))'];
    const speakSleep = 3000;

    const getVoices = () => {
        let list = [];
        voices.forEach((voice, index) => {
            if (voice.lang === "en-US" || voice.lang === "en-GB") {
                list.push({ name: voice.name, value: index})
            }
        });
        return list;
    }
    const voiceList = getVoices();

    const start = async (year, batch) => {
        stop();
        let wordsToBeTested = wordList[year]["words"][batch].filter((word) => !wordTested[word]);
        wordsToBeTested.map(async (key, i) => {
            timers.push(setTimeout(() => {
                    for(let j = 0; j<repeatTime; j++) {
                        setTimeout(() => {
                            speak({ text: key, voice: voices[voice]});
                        }, speakSleep * j);
                    }
                    wordTested[key] = true;
                }, waitTime * 1000 * i)
            );
        })
    }

    const stop = () => {
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
                for (let year in data) {
                    let array = [...data[year].words].sort(() => Math.random() - 0.5);
                    let i = 1;
                    newWordList[year] = { "year" : year };
                    newWordList[year] = { "words" : {} };
                    while (array.length > 0) {
                        let key = i.toString();
                        let batch = array.splice(0, numberOfWord);
                        newWordList[year]["words"]["Batch" + key] = [];
                        batch.forEach((word) => {
                            newWordList[year]["words"]["Batch" + key].push(word);
                        })
                        i++;
                    }
                }
                setSelectedGroup(Object.keys(newWordList[Object.keys(newWordList)[0]]["words"])[0]);
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
                    <Form.Range value={waitTime} onChange={waitTimeSliderChange} min={repeatTime * (speakSleep / 1000) } max="30" />
                    <Form.Label>Repeat ({repeatTime} X)</Form.Label>
                    <Form.Range value={repeatTime} onChange={repeatSliderChange} min="1" max="3" />
                    <Form.Label>Number of words({numberOfWord})</Form.Label>
                    <Form.Range value={numberOfWord} onChange={numberOfWordSliderChange} min="5" max="30" step="5" />
                    <Form.Label>Voice</Form.Label>
                    
                    {voiceList.map((item) => {
                        return <div key={ "div" + item.name + item.value } className="flexLayout">
                                <Form.Check key={"voice" + item.name + item.value} value={item.value} type="radio" label={item.name} onChange={() => voiceChanged(item.value)} checked={item.value === voice} />
                                <Button key={"button" + item.name +item.value} className="linkButton" variant="link" onClick={() => { speak({text: item.name, voice: voices[item.value] }) }}>Test</Button>
                            </div>
                        })
                    }
                </Accordion.Body> 
            </Accordion.Item>
            <Accordion.Item eventKey="1">
                <Accordion.Header>Batches</Accordion.Header>
                <Accordion.Body>
                    <Tabs key="tabs">
                        {Object.keys(wordList).map((year) => {
                            return <Tab key={"tab_" + year} eventKey={year} title={wordData[year].name}>
                                <ListGroup key={"group_" + year} activeKey={"#" + selectedGroup}>
                                    {
                                        Object.keys(wordList[year]["words"]).map((batch) => {
                                        return (
                                            <ListGroup.Item key={batch} action href={"#" + batch} onClick={() => batchSelected(batch)}>
                                                {
                                                    wordList[year]["words"][batch].map((word) => {
                                                        return <Form.Label className={wordTested[word] ? "word word-tested": "word"} key={word} >{word}</Form.Label>
                                                    })
                                                }
                                                <br/>
                                                <Button className="button bg-info" disabled={selectedGroup !== batch} onClick={() => start(year, batch)}> Start </Button>
                                            </ListGroup.Item>
                                            )
                                        })
                                    }
                                </ListGroup>
                            </Tab>
                        })}
                    </Tabs>
                </Accordion.Body> 
            </Accordion.Item>
        </Accordion>
    );
};
export default Speech;