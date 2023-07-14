import { dbService } from "fbase";
import React, { useEffect, useState } from "react";
import Twit from "components/Twit";

const Home = ({ userObj }) => {
  const [twit, setTwit] = useState("");
  const [twits, setTwits] = useState([]);

  useEffect(() => {
    dbService
      .collection("twits")
      .orderBy("createdAt")
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
    await dbService.collection("twits").add({
      text: twit,
      createdAt: Date.now(),
      creatorId: userObj.uid,
    });
    setTwit("");
  };
  const onChange = (event) => {
    const {
      target: { value },
    } = event;
    setTwit(value);
    // equal to setTweet(event.target.value);
  };
  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={twit}
          onChange={onChange}
          type="text"
          placeholder="What's on your mind?"
          maxLength={120}
        />
        <input type="submit" value="Twit" />
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
