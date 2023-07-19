import React, { useState } from "react";
import { dbService, storageService } from "fbase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";

const Twit = ({ twitObj, isOwner }) => {
  const getTime = (timeStamp) => {
    const inputTime = new Date(timeStamp);
    const year = inputTime.getFullYear();
    const month = inputTime.getMonth();
    const date = inputTime.getDate();
    const hour = inputTime.getHours();
    const minute = inputTime.getMinutes();
    return `${year}.${month}.${date}  ${hour}:${minute}`;
  };
  const time = getTime(twitObj.createdAt);

  const [isEditing, setIsEditing] = useState(false);
  const [newTwit, setNewTwit] = useState(twitObj.text);
  const onDeleteClick = async () => {
    const sure = window.confirm("Are you sure you want to delete this twit?");
    if (sure) {
      await dbService.doc(`twits/${twitObj.id}`).delete();
      if (twitObj.attachmentUrl) {
        await storageService.refFromURL(twitObj.attachmentUrl).delete();
      }
    }
  };
  const toggleEditing = () => {
    setIsEditing((prev) => !prev);
  };
  const changeTwit = (event) => {
    setNewTwit(event.target.value);
  };
  const submitTwit = (event) => {
    event.preventDefault();
    dbService.doc(`twits/${twitObj.id}`).update({ text: newTwit });
    setIsEditing(false);
  };

  return (
    <div className="nweet">
      {isEditing ? (
        <>
          <form onSubmit={submitTwit} className="container nweetEdit">
            <input
              type="text"
              placeholder="Edit your twit"
              value={newTwit}
              onChange={changeTwit}
              className="formInput"
              autoFocus
            />
            <input type="submit" value="Update Twit" className="formBtn" />
          </form>
          <span onClick={toggleEditing} className="formBtn cancelBtn">
            Cancel
          </span>
        </>
      ) : (
        <>
          <h4>{twitObj.text}</h4>
          <h6>{time}</h6>
          <h6>{twitObj.creatorName}</h6>
          <img src={twitObj.creatorPhotoURL} width="20px" objectheight="20px" />
          {twitObj.attachmentUrl && <img src={twitObj.attachmentUrl} />}
          {isOwner && (
            <div class="nweet__actions">
              <span onClick={onDeleteClick}>
                <FontAwesomeIcon icon={faTrash} />
              </span>
              <span onClick={toggleEditing}>
                <FontAwesomeIcon icon={faPencilAlt} />
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Twit;
