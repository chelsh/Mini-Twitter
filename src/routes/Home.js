import React, { useEffect, useState } from "react";
import { dbService } from "fbase";
import Twit from "components/Twit";
import TwitFactory from "components/TwitFactory";

const Home = ({ userObj }) => {
  const [twits, setTwits] = useState([]);

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

  return (
    <div className="container">
      <TwitFactory userObj={userObj} />
      <div style={{ marginTop: 30 }}>
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
