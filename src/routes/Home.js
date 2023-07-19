import { dbService, storageService } from "fbase";
import React, { useEffect, useState } from "react";
import Twit from "components/Twit";
import { v4 as uuidv4 } from "uuid";

const Home = ({ userObj }) => {
  const [twit, setTwit] = useState("");
  const [twits, setTwits] = useState([]);
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    dbService
      .collection("twits")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const twitArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTwits(twitArray);
      });
  }, []);
  // Another way to setTwits
  // const getTwits = async () => {
  //   const dbTwits = await dbService.collection("twits").get();
  //   dbTwits.forEach((document) => {
  //     const twitObject = {
  //       ...document.data(),
  //       id: document.id,
  //     };
  //     setTwits((prev) => [twitObject, ...prev]);
  //   });
  // };
  // useEffect(() => {
  //   getTwits();
  // }, []);
  const onSubmit = async (event) => {
    event.preventDefault();
    const twitObj = {
      text: twit,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      creatorName: userObj.displayName,
      creatorPhotoURL: userObj.photoURL,
    };
    if (attachment !== null) {
      const attachmentRef = storageService
        .ref()
        .child(`${userObj.uid}/${uuidv4()}`);
      const response = await attachmentRef.putString(attachment, "data_url");
      const attachmentUrl = await response.ref.getDownloadURL();
      twitObj.attachmentUrl = attachmentUrl;
    }
    await dbService.collection("twits").add(twitObj);
    setTwit("");
    setAttachment(null);
  };
  const onTextChange = (event) => {
    const {
      target: { value },
    } = event;
    setTwit(value);
  };
  const onFileChange = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(theFile);
  };
  const onClearAttachmentClick = () => {
    setAttachment(null);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={twit}
          onChange={onTextChange}
          type="text"
          placeholder="What's on your mind?"
          maxLength={120}
        />
        <input type="file" accept="image/*" onChange={onFileChange} />
        <input type="submit" value="Twit" />
        {attachment && (
          <div>
            <img src={attachment} width="50px" height="50px" />
            <button onClick={onClearAttachmentClick}>Clear Photo</button>
          </div>
        )}
      </form>
      <div>
        {twits.map((twit) => (
          <Twit
            key={twit.id}
            twitObj={twit}
            isOwner={twit.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
