import React, { useEffect, useRef, useState } from 'react'
import countries from "../utils/data.js"
import axios from 'axios';

const Translate = () => {
  const [isRotated, setIsRotated] = useState(false);

  const fromTextRef = useRef(null);
  const toTextRef = useRef(null);
  const exchageIconRef = useRef(null);
  const selectTagRefs = [useRef(null), useRef(null)];

  const handleExchangeClick = () => {
    const fromText = fromTextRef.current;
    const toText = toTextRef.current;
    const selectTag = selectTagRefs.map(ref => ref.current);

    setIsRotated(!isRotated);
    let tempText = fromText.value;
    fromText.value = toText.value;
    toText.value = tempText;
    let tempLang = selectTag[0].value;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;

  };

  const fromTextKeyUp = () => {
    const fromText = fromTextRef.current;
    const toText = toTextRef.current;

    if (!fromText.value) {
      toText.value = ""
    }
  }

  const translateText = () => {
    const fromText = fromTextRef.current;
    const toText = toTextRef.current;
    const selectTag = selectTagRefs.map(ref => ref.current);

    let text = fromText.value.trim();
    let translateFrom = selectTag[0].value;
    let translateTo = selectTag[1].value;

    if (!text) return;
    toText.setAttribute('placeholder', 'Translating...');
    let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;

    axios.get(apiUrl)
      .then((res) => {
        toText.value = res.data.responseData.translatedText;
      })
      .catch((error) => {
        console.log('ERROR ', error);
      })
      .finally(() => {
        toText.setAttribute('placeholder', 'Translation');
      });
  }

  const startSpeechRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = selectTagRefs[0].current.value;

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      fromTextRef.current.value = speechResult;
    };

    recognition.start();
  };

  useEffect(() => {
    const fromText = fromTextRef.current;
    const toText = toTextRef.current;
    const selectTag = selectTagRefs.map(ref => ref.current);
    const icons = document.querySelectorAll(".row i");

    const handleClick = ({ target }) => {
      if (!fromText.value || !toText.value) return;
      if (target.classList.contains("fa-copy")) {
        if (target.id.startsWith("from")) {
          navigator.clipboard.writeText(fromText.value);
        } else {
          navigator.clipboard.writeText(toText.value);
        }
      } else {
        let utterance;
        if (target.id.startsWith("from")) {
          utterance = new SpeechSynthesisUtterance(fromText.value);
          utterance.lang = selectTag[0].value;
        } else {
          utterance = new SpeechSynthesisUtterance(toText.value);
          utterance.lang = selectTag[1].value;
        }
        speechSynthesis.speak(utterance);
      }
    };

    selectTag.forEach((tag, id) => {
      for (const country_code in countries) {
        let selected = id == 0 ? country_code == 'en-GB' ?
          "selected" : "" : country_code == 'sa-IN' ? 'selected' : '';

        let option = `<option ${selected} value=${country_code}>${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option)
      }
    })

    icons.forEach((icon) => {
      icon.addEventListener("click", handleClick);
    });

    return () => {
      icons.forEach((icon) => {
        icon.removeEventListener("click", handleClick);
      });
    };
  }, [fromTextRef, toTextRef, selectTagRefs])

  return (
    <div className="container">
      <div className="wrapper">
        <ul className="controls">
          <li className="row from">
            <div className="icons">
              <i onClick={startSpeechRecognition} id="from" className="fas fa-microphone"></i>
              <i id="from" className="fas fa-volume-up"></i>
              <i id="from" className="fas fa-copy"></i>
            </div>
            <select ref={selectTagRefs[0]}></select>
          </li>
          <li className={`exchange ${isRotated ? 'rotate' : ''}`}
            onClick={handleExchangeClick} ref={exchageIconRef}>
            <i className="fas fa-exchange-alt"></i>
          </li>
          <li className="row to">
            <select ref={selectTagRefs[1]}></select>
            <div className="icons">
              <i id="to" className="fas fa-volume-up"></i>
              <i id="to" className="fas fa-copy"></i>
            </div>
          </li>
        </ul>
        <div className="text-input">
          <textarea
            onKeyUp={fromTextKeyUp}
            spellCheck="false"
            ref={fromTextRef}
            className="from-text"
            placeholder="Enter text"
          ></textarea>
          <textarea
            spellCheck="false"
            readOnly
            disabled
            ref={toTextRef}
            className="to-text"
            placeholder="Translation"
          ></textarea>
        </div>
      </div>
      <button onClick={translateText}>Translate Text</button>
    </div>
  )
}

export default Translate