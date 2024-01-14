import React, { useEffect } from "react";
import SpellTest from "./SpellTest";
import Button from 'react-bootstrap/Button';

const SpellBatch = (props) => {
    const [index, setIndex] = React.useState(-1);
    const [started, setStarted] = React.useState(false);
    const [timers, setTimers] = React.useState([]);

    React.useEffect(() => {
        console.log("Spell Batch", props.words, started);
        // if (index === 0) {
        //     for (let i = 0; i < props.words.length; i++) {
        //         setTimeout(() => {
        //             setIndex(i);
        //         }, 3000 * i)
        //     }
        // }
    }, [])

    React.useEffect(() => {
        console.log("started:", started, props.settings);
        if (started) {
            for (let i = index; i < props.words.length; i++) {
                timers.push(setTimeout(() => {
                    setIndex(i);
                }, props.settings.waitTime * 1000 * i));
            }
        } else {
            timers.forEach(timer => {clearTimeout(timer)});
        }
    }, [started]);

    return (
        <>
            <SpellTest word={props.words[index]} voice={props.voice} settings={props.settings} setCorrectWord={props.setCorrectWord}/>
            {   
                started ?
                    <>
                        <Button className="button bg-info"  onClick={() => setStarted(false)}>Stop</Button>
                        <Button className="button bg-info"  onClick={() => setIndex((prevIndex) => prevIndex + 1)}>Next</Button> 
                    </>
                : 
                   <Button className="button bg-info"  onClick={() => setStarted(true)}>Start</Button>
            }
        </>
    );
};
export default SpellBatch;