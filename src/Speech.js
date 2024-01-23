import React, { useCallback, useEffect, useRef } from "react";
import { useSpeechSynthesis }from "react-speech-kit";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ListGroup from 'react-bootstrap/ListGroup';
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import SpellBatch from "./components/SpellBatch";
import wordsJSON from "./words.json";

const Speech = () => {
    const { speak, voices } = useSpeechSynthesis();
    const [settings, setSettings] = React.useState({});
    const [voice, setVoice] = React.useState(0);
    const [enabledWebCam, setEnabledWebCam] = React.useState(false);
    const [rate, setRate] = React.useState(1);
    const [wordData, setWordData] = React.useState(wordsJSON);
    const [wordList, setWordList] = React.useState({});
    const [wordTested, setWordTested] = React.useState({});
    const [waitTime, setWaitTime] = React.useState(10);
    const [repeatTime, setRepeatTime] = React.useState(2);
    const [numberOfWord, setNumberOfWord] = React.useState(20);
    const [selectedGroup, setSelectedGroup] = React.useState("");
    const webcamRef = useRef(null);
    const [img, setImg] = React.useState(null);
    const [text, setText] = React.useState(null);
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImg(imageSrc);
      }, [webcamRef]);

    const voiceNames = ['Samantha', 'Aaron', 'Daniel (English (United Kingdom))'];
    const speakSleep = 3000;
    
    const getMinWaitTime = () => {
        return (repeatTime * speakSleep + speakSleep) / 1000;
    }
    
    const saveSettings = () => {
        localStorage.setItem('settings', JSON.stringify(settings));
    } 

    const [minWaitTime, setMinWaitTime] = React.useState(getMinWaitTime());

    const getVoices = () => {
        let list = [];
        voices.forEach((v, index) => {
            if (v.lang === "en-US" || v.lang === "en-GB") {
                list.push({ name: v.name, value: index})
            }
        });
        return list;
    }
    const voiceList = getVoices();

    const rateSliderChange = (e) => {
        setRate(e.target.value);
        settings["rate"] = e.target.value;
        saveSettings();
    };

    const waitTimeSliderChange = (e) => {
        setWaitTime(e.target.value);
        settings["waitTime"] = e.target.value;
        saveSettings();
    };

    const repeatSliderChange = (e) => {
        setRepeatTime(e.target.value);
        let min = getMinWaitTime();
        if (waitTime > min) {
            setMinWaitTime(min);
        }
        settings["repeatTime"] = e.target.value;
        saveSettings();
    };
    
    const numberOfWordSliderChange = (e) => {
        setNumberOfWord(e.target.value);
        settings["numberOfWord"] = e.target.value;
        saveSettings();
    }
    
    const batchSelected = (batch) => {
        setSelectedGroup(batch);
        settings["selectedGroup"] = batch;
        saveSettings();
    }

    const voiceChanged = (selectedVoice) => {
        setVoice(selectedVoice);
        settings["voice"] = selectedVoice;
        saveSettings();
    }

    const generateWordList = (data) => {
        if (!data) return;
        setWordList((oldWordList) => {
                let newWordList = {};
                for (let year in data) {
                    let array = [...data[year].words].sort(() => Math.random() - 0.5);
                    let i = 1;
                    newWordList[year] = { "words" : {}, "year": year, "started": false, batch: "" };
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

    const videoConstraints = {
        width: { min: 1920},
        height: { min: 1080},
        facingMode: "environment",
    };

    const tryORC = () => {
        console.log("Start OCR");
        // const imageSrc = this.webcamRef.current.getScreenshot();
        if (!img) return;
        Tesseract.recognize(img, "eng", {
          logger: (m) => console.log(m.progress)
        }).then(({ data: { text } }) => {
          // console.log(text);
          setText(text);
        });
    };

    const setCorrectWord = async (word, isCorrect) => {
        if (word) {
            wordTested[word] = isCorrect;
            forceUpdate();
        }
    };

    const setYearStarted = (year, batch, started) => {
        if (wordList) {
            if (started)
                wordList[year]["batch"] = batch;
            else
                wordList[year]["batch"] = "";
            forceUpdate();
        }
    };

    useEffect(() => {
        tryORC();
    }, [img])

    useEffect(() => {
        generateWordList(wordData);
    }, [wordData, numberOfWord])

    useEffect(() => {
        const localSettings = JSON.parse(localStorage.getItem("settings"));
        if (localSettings) {
            setSettings(localSettings);
        }
    }, []);

    useEffect(() => {
        console.log(settings);
        if (Object.keys(settings).length > 0) {
            setWaitTime(settings["waitTime"] ? settings["waitTime"] : waitTime);
            setNumberOfWord(settings["numberOfWord"] ? settings["numberOfWord"] : numberOfWord);
            setRepeatTime(settings["repeatTime"] ? settings["repeatTime"] : repeatTime);
            setVoice(settings["voice"] ? settings["voice"] : voice);
        } else {
            settings["waitTime"] = waitTime;
            settings["numberOfWord"] = numberOfWord;
            settings["repeatTime"] = repeatTime;
            settings["voice"] = voice;
            saveSettings();
        }
    }, [numberOfWord, repeatTime, saveSettings, settings, voice, waitTime])

    const onActiveKeyChange = (e) => {
        setEnabledWebCam(e.includes("2"));
    }

    return (        
        <Accordion defaultActiveKey={['1']} alwaysOpen onSelect={(e) => onActiveKeyChange(e)}>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Settings</Accordion.Header>
                <Accordion.Body>
                    <Form.Label>Speed </Form.Label>
                    <Form.Range value={rate} onChange={rateSliderChange} min="0.5" max="2" step="0.1" />
                    <Form.Label>Wait time ({waitTime} seconds)</Form.Label>
                    <Form.Range value={waitTime} onChange={waitTimeSliderChange} min={minWaitTime} max="30" />
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
                                            <ListGroup.Item key={year + batch} action href={"#" + year + batch} onClick={() => batchSelected(year + batch)}>
                                                {
                                                    wordList[year].batch !== batch ?
                                                    wordList[year]["words"][batch].map((word) => {
                                                        return <Form.Label className={wordTested[word] ? "word word-tested": "word"} key={word}>{word}</Form.Label>
                                                    })
                                                    : <></>
                                                }
                                                <br/>
                                                {
                                                    selectedGroup === year + batch ?    
                                                    <>
                                                        <SpellBatch words={wordList[year]["words"][batch]} 
                                                                    voice={voice} 
                                                                    settings={settings}
                                                                    setCorrectWord={setCorrectWord} 
                                                                    setYearStarted={setYearStarted}
                                                                    year={year}
                                                                    batch={batch}
                                                                    />
                                                    </>
                                                    :
                                                    <></>
                                                }
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
            <Accordion.Item eventKey="2">
                <Accordion.Header>Capture</Accordion.Header>
                <Accordion.Body>
                { enabledWebCam ?
                    <div className="Container">
                        {img === null ? (
                            <>
                            <Webcam
                                audio={false}
                                mirrored={false}
                                height={400}
                                width={400}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                            />
                            <Button onClick={capture}>Capture photo</Button>
                            </>
                        ) : (
                            <>
                            <img src={img} alt="screenshot" />
                            <Button onClick={() => setImg(null)}>Retake</Button>
                            </>
                        )}
                        {text}
                    </div>
                    :
                    <></>
                }
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    );
};
export default Speech;