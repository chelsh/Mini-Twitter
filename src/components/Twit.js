import { dbService } from "fbase";
import React, { useState } from "react";

const Twit = ({ twitObj, isOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTwit, setNewTwit] = useState(twitObj.text);
  const onDeleteClick = async () => {
    const sure = window.confirm("Are you sure you want to delete this twit?");
    if (sure) {
      await dbService.doc(`twits/${twitObj.id}`).delete();
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
    <div>
      {isEditing ? (
        <>
          <form onSubmit={submitTwit}>
            <input
              type="text"
              placeholder="Edit your twit"
              value={newTwit}
              onChange={changeTwit}
              required
            />
            <input type="submit" value="Update Twit" />
          </form>
          <button onClick={toggleEditing}>Cancle</button>
        </>
      ) : (
        <>
          <h4>{twitObj.text}</h4>
          {isOwner && (
            <>
              <button onClick={onDeleteClick}>Delete Twit</button>
              <button onClick={toggleEditing}>Edit Twit</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Twit;
