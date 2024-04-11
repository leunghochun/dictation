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
import Batch from "./components/Batch";
import wordsJSON from "./words.json";

const Dictation = () => {

    const getSettings = () => {
        const localSettings = JSON.parse(localStorage.getItem("settings"));
        return  localSettings ? localSettings : {};
    }

    const isEmptySetting = (key, value) => {
        return Object.keys(settings).length > 0 && settings[key] ? settings[key] : value;
    }

    const webcamRef = useRef(null);
    const { speak, voices } = useSpeechSynthesis();
    const [settings, setSettings] = React.useState(getSettings());
    const [voice, setVoice] = React.useState();
    const [enabledWebCam, setEnabledWebCam] = React.useState(false);
    const [wordData, setWordData] = React.useState(wordsJSON);
    const [wordList, setWordList] = React.useState({});
    const [wordTested, setWordTested] = React.useState({});
    const [rate, setRate] = React.useState(isEmptySetting("rate", 1));
    const [waitTime, setWaitTime] = React.useState(isEmptySetting("waitTime", 10)); 
    const [repeatTime, setRepeatTime] = React.useState(isEmptySetting("repeatTime", 2));
    const [numberOfWord, setNumberOfWord] = React.useState(isEmptySetting("numberOfWord", 5));
    const [numberOfAttempt, setNumberOfAttempt] = React.useState(isEmptySetting("numberOfAttempt", 5));
    const [selectedGroup, setSelectedGroup] = React.useState("");
    const [img, setImg] = React.useState(null);
    const [text, setText] = React.useState(null);

    const speakIt = (text) => {
        console.log("speak word:", text);
        speak({ text: text, rate: settings.rate ? settings.rate : "1"});
    };

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImg(imageSrc);
      }, [webcamRef]);

    const speakSleep = 3000;
    
    const getMinWaitTime = () => {
        return (repeatTime * speakSleep + speakSleep) / 1000;
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
    };

    const waitTimeSliderChange = (e) => {
        setWaitTime(e.target.value);
    };

    const repeatSliderChange = (e) => {
        setRepeatTime(e.target.value);
        let min = getMinWaitTime();
        if (waitTime > min) {
            setMinWaitTime(min);
        }
    };
    
    const numberOfAttemptSliderChange = (e) => {
        setNumberOfAttempt(e.target.value);
    }

    const numberOfWordSliderChange = (e) => {
        setNumberOfWord(e.target.value);
    }
    
    const batchSelected = (year, batch) => {
        setSelectedGroup(year + batch);
    }

    const voiceChanged = (selectedVoice) => {
        setVoice(selectedVoice);
    }

    // const generateWordList = (data) => {
    //     if (!data) return;
    //     setWordList((oldWordList) => {
    //             let newWordList = {};
    //             for (let year in data) {
    //                 let array = [...data[year].words].sort(() => Math.random() - 0.5);
    //                 let i = 1;
    //                 newWordList[year] = { "words" : {}, "year": year, "started": false, batch: "" };
    //                 while (array.length > 0) {
    //                     let key = i.toString();
    //                     let batch = array.splice(0, numberOfWord);
    //                     newWordList[year]["words"]["Batch" + key] = [];
    //                     newWordList[year]["Batch" + key + "NoOfCorrect"] = 0;
    //                     batch.forEach((word) => {
    //                         newWordList[year]["words"]["Batch" + key].push(word);
    //                     })
    //                     i++;
    //                 }
    //             }
    //             let firstKey = Object.keys(newWordList)[0];
    //             batchSelected(newWordList[firstKey]["year"], Object.keys(newWordList[firstKey]["words"])[0]);
    //             return newWordList;
    //     });
    // }

    const videoConstraints = {
        width: { min: 1920},
        height: { min: 1080},
        facingMode: "environment",
    };

    const tryORC = () => {
        if (!img) return;
        Tesseract.recognize(img, "eng", {
          logger: (m) => console.log(m.progress)
        }).then(({ data: { text } }) => {
          setText(text);
        });
    };

    const setCorrectWord = async (word, isCorrect, year, batch) => {
        if (word) {
            wordTested[word] = isCorrect;
            let noOfCorrect = 0;
            wordList[year]["words"][batch].forEach((word) => noOfCorrect += wordTested[word] ? 1 : 0);
            wordList[year][batch + "NoOfCorrect"] = noOfCorrect;
        }
    };

    const setYearStarted = (year, batch, started) => {
        if (wordList) {
            wordList[year]["batch"] = started ? batch : "";
            if (!started) {
                wordList[year]["words"][batch].forEach((word) => wordTested[word] = false);
            }
        }
    };

    const triggerSpeakTest = (item) => {
        speak({text: item.name + "testing 123"});
    }

    useEffect(() => {
        tryORC();
    }, [img])

    useEffect(() => {
        const localSettings = JSON.parse(localStorage.getItem("settings"));
        if (localSettings) {
            setSettings(localSettings);
        }
    }, []);

    useEffect(() => {
        settings["numberOfWord"] = numberOfWord;
        settings["numberOfAttempt"] = numberOfAttempt;
        settings["waitTime"] = waitTime;
        settings["repeatTime"] = repeatTime;
        settings["voice"] = voice;
        settings["rate"] = rate;
        settings["selectedGroup"] = selectedGroup;

        localStorage.setItem('settings', JSON.stringify(settings));
    },[numberOfAttempt, numberOfWord, rate, repeatTime, selectedGroup, settings, voice, waitTime])

    useEffect(() => {
        if (!wordData) return;
        setWordList(() => {
                let newWordList = {};
                for (let year in wordData) {
                    let array = [...wordData[year].words].sort(() => Math.random() - 0.5);
                    let i = 1;
                    newWordList[year] = { "words" : {}, "year": year, "started": false, batch: "" };
                    while (array.length > 0) {
                        let key = i.toString();
                        let batch = array.splice(0, numberOfWord);
                        newWordList[year]["words"]["Batch" + key] = [];
                        newWordList[year]["Batch" + key + "NoOfCorrect"] = 0;
                        batch.forEach((word) => {
                            newWordList[year]["words"]["Batch" + key].push(word);
                        })
                        i++;
                    }
                }
                let firstKey = Object.keys(newWordList)[0];
                batchSelected(newWordList[firstKey]["year"], Object.keys(newWordList[firstKey]["words"])[0]);
                return newWordList;
        });
        // generateWordList(wordData);
    }, [wordData, numberOfWord]);

    const onActiveKeyChange = (e) => {
        setEnabledWebCam(e.includes("2"));
    }

    return (        
        <Accordion defaultActiveKey={['0']} alwaysOpen onSelect={(e) => onActiveKeyChange(e)}>
            <Accordion.Item eventKey="0">
                <Accordion.Header>Batches</Accordion.Header>
                <Accordion.Body>
                    <Tabs key="tabs">
                        {Object.keys(wordList).map((year) => {
                            return <Tab key={"tab_" + year} eventKey={year} title={wordData[year].name}>
                                <ListGroup key={"group_" + year} activeKey={"#" + selectedGroup}>
                                    {
                                        Object.keys(wordList[year]["words"]).map((batch) => {
                                        return (
                                            <ListGroup.Item key={year + batch} action href={"#" + year + batch} onClick={() => batchSelected(year,  batch)}>
                                                <Batch words={wordList[year]["words"][batch]} 
                                                        settings={settings}
                                                        setCorrectWord={setCorrectWord} 
                                                        setYearStarted={setYearStarted}
                                                        year={year}
                                                        batch={batch}
                                                        isShow={year + batch === selectedGroup ? true : false}
                                                        speakIt={speakIt}
                                                />
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
            <Accordion.Item eventKey="1">
                <Accordion.Header>Settings</Accordion.Header>
                <Accordion.Body>
                    <Form.Label>Speed </Form.Label>
                    <Form.Range value={rate} onChange={rateSliderChange} min="0.5" max="2" step="0.1" />
                    <Form.Label>Wait time ({waitTime} seconds)</Form.Label>
                    <Form.Range value={waitTime} onChange={waitTimeSliderChange} min={minWaitTime} max="30" />
                    <Form.Label>Repeat ({repeatTime} X)</Form.Label>
                    <Form.Range value={repeatTime} onChange={repeatSliderChange} min="1" max="3" />
                    <Form.Label>Number of Attempt ({numberOfAttempt})</Form.Label>
                    <Form.Range value={numberOfAttempt} onChange={(e) => {numberOfAttemptSliderChange(e)}} min="5" max="10" step="1" />
                    <Form.Label>Number of words({numberOfWord})</Form.Label>
                    <Form.Range value={numberOfWord} onChange={(e) => {numberOfWordSliderChange(e)}} min="5" max="30" step="5" />
                    <Form.Label>Voice</Form.Label>
                    {voiceList.map((item) => {
                        return <div key={ "div" + item.name + item.value } className="flexLayout">
                                <Form.Check key={"voice" + item.name + item.value} value={item.value} type="radio" label={item.name} onChange={() => voiceChanged(item.value)} checked={item.value === voice} />
                                <Button key={"button" + item.name +item.value} className="linkButton" variant="link" onClick={() => {triggerSpeakTest(item)}}>Test</Button>
                            </div>
                        })
                    }
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
export default Dictation;