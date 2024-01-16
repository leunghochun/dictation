import React from "react";
import Button from 'react-bootstrap/Button';
import { useSpeechSynthesis } from "react-speech-kit";
import SpellTest from "./SpellTest";
import ProgressBar from 'react-bootstrap/ProgressBar';

const SpellBatch = (props) => {
    const { speak, voices } = useSpeechSynthesis();
    const [ index, setIndex ] = React.useState(-1);
    const [ started, setStarted ] = React.useState(false);
    const [ timers, setTimers ] = React.useState([]);
    const [ progressTimer, setProgressTimer ] = React.useState();
    const [ countOfProgess, setCountOfProgess ] = React.useState(0);
    const [ counter, setCounter ] = React.useState(0);
    const speakSleep = 3000;

    // const timer = setInterval(() => {
    //     setCountOfProgess((oldProgress) => {
    //         console.log("timer");
    //         if (!started) return 0;
    //         if (counter === props.settings.waitTime) {
    //             setCounter(-1);
    //             setIndex((prevIndex)=> prevIndex + 0);
    //         } else {
    //             setCounter((counter) => counter + 1);
    //         }
    //         console.log("counter:", counter, ",", counter / props.settings.waitTime * 99);
    //         return counter/ props.settings.waitTime * 99;
    //     });
    // }, 999);

    const speakWord = (index) => {
        for(let j = 0; j < props.settings.repeatTime; j++) {
            timers.push(setTimeout(() => {
                speak({ text: props.words[index], voice: voices[props.settings.voice]});
            }, speakSleep * j));
        }
    };

    const stopSpeakWord = () =>{
        timers.forEach(timer => {clearTimeout(timer)});
        clearInterval(progressTimer);
    }

    const startClicked = (isStarted) => {
        if (!isStarted) {
            stopSpeakWord();
            setIndex(-1);
        } else {
            setIndex(0);
        }
        setStarted(isStarted);
    };

    React.useEffect(() => {
        console.log("index:", index);
        if (index < 0) return;
        speakWord(index);
    }, [index]);

    const ReloadMessage = () => {
        console.log("reload Message");
        setCountOfProgess((oldProgress) => {
            console.log("timer");
            if (!started) return 0;
            if (counter === props.settings.waitTime) {
                setCounter(-1);
                setIndex((prevIndex)=> prevIndex + 1);
            } else {
                setCounter((counter) => counter + 1);
            }
            console.log("counter:", counter, ",", counter / props.settings.waitTime * 100);
            return counter/ props.settings.waitTime * 100;
        });
    };

    React.useEffect(()=>{
        const tid = setInterval(ReloadMessage, 2000);

        return () => {
            clearInterval(tid);
        };
    }, [started, counter]);


    return (
        <>
            {   
                started ?
                    <>
                        <ProgressBar now={countOfProgess} />
                        <SpellTest word={props.words[index]} voice={props.voice} settings={props.settings} setCorrectWord={props.setCorrectWord}/>
                        <Button className="button bg-info"  onClick={() => {startClicked(false)}}>Stop</Button>
                        <Button className="button bg-info"  onClick={() => setIndex((prevIndex) => prevIndex + 1)}>Next</Button> 
                    </>
                : 
                   <Button className="button bg-info"  onClick={() => {startClicked(true)}}>Start</Button>
            }
            {"index:" + index}
            {"started:" + started}
        </>
    );
};
export default SpellBatch;