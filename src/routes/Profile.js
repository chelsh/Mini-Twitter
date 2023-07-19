import React, { useEffect, useState } from "react";
import { authService, dbService, storageService } from "fbase";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Twit from "components/Twit";

const Profile = ({ userObj }) => {
  const history = useHistory();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [errorMassage, setErrorMassage] = useState("");
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState("");
  const [myTwits, setMyTwits] = useState([]);
  const userProfile = {
    displayName: userObj.displayName,
    email: userObj.email,
    emailVerified: userObj.emailVerified,
    isAnonymous: userObj.isAnonymous,
    phoneNumber: userObj.phoneNumber,
    photoURL: userObj.photoURL,
    providerData: userObj.providerData,
    providerId: userObj.providerId,
    refreshToken: userObj.refreshToken,
    tenantId: userObj.tenantId,
    uid: userObj.uid,
  };

  useEffect(() => {
    const onDefaultProfile = async () => {
      if (userObj.displayName === null) {
        await userObj.updateProfile({
          displayName: userObj.email.split("@")[0],
        });
      }
      if (userProfile.photoURL === null) {
        const defaultPhotoUrl = process.env.REACT_APP_DEFAULT_PROFILE_PHOTO_URL;
        await userObj.updateProfile({
          photoURL: defaultPhotoUrl,
        });
      }
    };
    onDefaultProfile();
  }, []);

  useEffect(() => {
    const usersBucket = dbService.collection("users");
    usersBucket.doc(`user:${userProfile.uid}`).set(userProfile);
  }, []);

  const onLogOutClick = () => {
    authService.signOut();
    history.push("/");
  };

  useEffect(() => {
    dbService
      .collection("twits")
      .where("creatorId", "==", userObj.uid) //filtering the user
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const twitArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMyTwits(twitArray);
      });
  }, []);

  const toggleChangeName = () => {
    setIsEditingName((prev) => !prev);
  };
  const onChangeName = (event) => {
    setNewDisplayName(event.target.value);
  };
  const onSubmitName = async (event) => {
    event.preventDefault();
    if (userObj.displayName === newDisplayName) {
      setErrorMassage("Please write the different name.");
    } else if (newDisplayName.length < 3) {
      setErrorMassage("Please write the name longer than 2 letters.");
    } else {
      await userObj.updateProfile({ displayName: newDisplayName });
      const usersBucket = dbService.collection("users");
      usersBucket
        .doc(`user:${userProfile.uid}`)
        .update({ displayName: newDisplayName });
      setErrorMassage("");
      toggleChangeName();
    }
  };

  const toggleChangePhoto = () => {
    setIsEditingPhoto((prev) => !prev);
  };
  const onChangePhoto = (event) => {
    const {
      target: { files },
    } = event;
    const theFile = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setNewPhoto(result);
    };
    reader.readAsDataURL(theFile);
  };
  const onSubmitPhoto = async (event) => {
    event.preventDefault();
    if (newPhoto !== "") {
      const photoRef = storageService.ref().child(`${userObj.uid}/${uuidv4()}`);
      const response = await photoRef.putString(newPhoto, "data_url");
      const newPhotoURL = await response.ref.getDownloadURL();
      await userObj.updateProfile({ photoURL: newPhotoURL });
      const usersBucket = dbService.collection("users");
      usersBucket
        .doc(`user:${userProfile.uid}`)
        .update({ photoURL: newPhotoURL });
      setNewPhoto("");
      toggleChangePhoto();
    } else {
      const defaultPhotoUrl = process.env.REACT_APP_DEFAULT_PROFILE_PHOTO_URL;
      setNewPhoto(defaultPhotoUrl);
      await userObj.updateProfile({
        photoURL: defaultPhotoUrl,
      });
      const usersBucket = dbService.collection("users");
      usersBucket
        .doc(`user:${userProfile.uid}`)
        .update({ photoURL: defaultPhotoUrl });
      setNewPhoto("");
      toggleChangePhoto();
    }
  };

  return (
    <>
      <div>
        <h2>{userObj.displayName}</h2>
        <img src={userObj.photoURL} width="150px" height="150px" />
      </div>
      {isEditingName ? (
        <>
          <form onSubmit={onSubmitName}>
            <input
              onChange={onChangeName}
              type="text"
              placeholder="Write your new user name"
              value={newDisplayName}
              required
            />
            <input type="submit" value="Edit" onSubmit={onSubmitName} />
            <button onClick={toggleChangeName}>Cancel</button>
            {errorMassage}
          </form>
        </>
      ) : (
        <button onClick={toggleChangeName}>Change user name</button>
      )}
      {isEditingPhoto ? (
        <>
          <form onSubmit={onSubmitPhoto}>
            <input onChange={onChangePhoto} type="file" accept="image/*" />
            <input type="submit" value="Edit" onSubmit={onSubmitPhoto} />
            {newPhoto && (
              <div>
                <img src={newPhoto} width="80px" height="80px" />
              </div>
            )}
            <button onClick={toggleChangePhoto}>Cancel</button>
          </form>
        </>
      ) : (
        <button onClick={toggleChangePhoto}>Change user Photo</button>
      )}
      <button onClick={onLogOutClick}>Sign Out</button>
      <div>
        <h2>My Twits</h2>
        {myTwits.map((twit) => (
          <Twit
            key={twit.id}
            twitObj={twit}
            isOwner={twit.creatorId === userObj.uid}
          />
        ))}
      </div>
    </>
  );
};

export default Profile;
