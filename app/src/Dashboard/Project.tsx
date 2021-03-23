import React, { useState, } from 'react';
import { useMutation } from '@apollo/client';
import { 
  ADD_LIKE,
  MAKE_COPY,
  DELETE_PROJECT,
  PUBLISH_PROJECT,
  ADD_COMMENT,
} from './gqlStrings';
import { withStyles, createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import AddCommentIcon from '@material-ui/icons/AddComment';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import GetAppIcon from '@material-ui/icons/GetApp';
import IconButton from '@material-ui/core/IconButton';
import PublishIcon from '@material-ui/icons/Publish';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import createModal from '../components/right/createModal';
// Variable validation using typescript
type props = {
  name: string,
  id: string,
  userId: string,
  username: string,
  likes: number,
  published: boolean,
  comments: object[],
};

// Use current user info to make a make copy of another user's project
const currUserSSID = window.localStorage.getItem('ssid') || 'unavailable';
const currUsername = window.localStorage.getItem('username') || 'unavailable';

const Project = ({
  name, likes, id, username, published, comments,
}: props) : JSX.Element => {
  // IMPORTANT:
  // 1) schema change projId => id to allows Apollo Client cache auto-update. Only works with 'id'
  // 2) always request the 'id' in a mutation request
  const [commentVal, setCommentVal] = useState('');
  const [clicked, setClicked] = useState(false);
  const [modal, setModal] = useState(null);

  const [addLike] = useMutation(ADD_LIKE);
  const [makeCopy] = useMutation(MAKE_COPY);
  const [deleteProject] = useMutation(DELETE_PROJECT);
  const [publishProject] = useMutation(PUBLISH_PROJECT);
  const [addComment] = useMutation(ADD_COMMENT);

  const noPointer = {cursor: 'default'};

  //Likes the project when the star icon is clicked
  function handleLike(e) {
    e.preventDefault();
    let myVar = {
      variables: 
      {
        projId: id,
        likes: likes,
      },
    };
    if(clicked === false) {
      setClicked(true);
      myVar.variables.likes = likes + 1
      addLike(myVar);
    } else {
      setClicked(false); 
      myVar.variables.likes = likes - 1
      addLike(myVar);
    }
  }

  //Makes a copy of the public project and saves as a user project
  function handleDownload(e) {
    e.preventDefault();
    const myVar = {
      variables:
      {
        projId: id,
        userId: currUserSSID,
        username: currUsername,
      },
    };
    makeCopy(myVar);
  }

  //Publishes project from user dashboard to public dashboard
  function handlePublish(e) {
    e.preventDefault();
    const myVar = {
      variables:
      {
        projId: id,
        published: !published,
      },
    };
    publishProject(myVar);
  }

  //Adds the comment to the project
  function handleComment(e) {
    e.preventDefault();
    const myVar = {
      variables:
      {
      projId: id,
      comment: commentVal,
      username: currUsername,
      },
    };
    addComment(myVar)
  }

  //sets state of commentVal to what the user types in to comment
  function handleChange(e) {
    e.preventDefault();
    let commentValue = e.target.value;
    setCommentVal(commentValue);
  }

  const recentComments = [];
  if (comments.length > 0) { 
    const reversedCommentArray = comments.slice(0).reverse();
    const min = Math.min(6, reversedCommentArray.length)
    for (let i = 0; i < min ; i++) {
    recentComments.push(
      <p className='comment'>
        <b>{ reversedCommentArray[i].username }</b>: 
        { reversedCommentArray[i].text }
      </p>
        )}
  }

  // ---Clear canvas functionality---
  // Closes out the open modal
  const closeModal = () => setModal('');

  // Creates modal that asks if user wants to clear workspace
  // If user clears their workspace, then their components are removed from state and the modal is closed
  const clearWorkspace = () => {
    //Deletes project from the database
  const handleDelete = (e) => {
    e.preventDefault();
    const myVar = {
      variables:
      {
        projId: id,
      },
    };
    deleteProject(myVar);
  }

    // Set modal options
    const children = (
      <List className="export-preference">
        <ListItem
          key={'clear'}
          button
          onClick={handleDelete}
          style={{
            border: '1px solid #3f51b5',
            marginBottom: '2%',
            marginTop: '5%'
          }}
        >
          <ListItemText
            primary={'Yes, delete this project'}
            style={{ textAlign: 'center' }}
            onClick={closeModal}
          />
        </ListItem>
      </List>
    );

    // Create modal
    setModal(
      createModal({
        closeModal,
        children,
        message: 'Are you sure want to delete this project?',
        primBtnLabel: null,
        primBtnAction: null,
        secBtnAction: null,
        secBtnLabel: null,
        open: true
      })
    );
  };

  return (
  <div className = 'project'>
    { currUsername === username ?
      <IconButton tooltip = "Delete Project" onClick={ clearWorkspace } style={{position: 'absolute', right: '0', padding: '0'}}>
        <CloseIcon/>
      </IconButton>
    : '' }
    <div className = 'header'>
      <div className = 'projectInfo'>
        <h2>Project: { name }</h2>
        <h3>Author: { username }</h3>
        <h3>Likes: { likes }</h3>
      </div>
      <div className = "icons">
          <IconButton tooltip="Like Template" style={noPointer} onClick = { handleLike }>
            {clicked ? <StarIcon fontSize='Large' style={{color:'#FFD700'}}/> : <StarBorderIcon fontSize='Large' style={{color:'#FFD700'}}/>}
          </IconButton> 
        { currUsername !== username ?
          <IconButton tooltip ="Download Template" style={noPointer} onClick={ handleDownload }>
            <GetAppIcon fontSize="large" className="download"/> 
          </IconButton>       
        : '' }
        { currUsername === username ?
          <IconButton tooltip ="Publish Template" style={noPointer} onClick={ handlePublish }>
            <PublishIcon fontSize="large"/> 
          </IconButton>
          : '' }
      </div>
    </div>
  <hr/>
    { published ? 
      <div className = "commentArea">
          {recentComments}
          <br/>
          <div className = 'comments'>
            <span>
              <input type="text" placeholder="Add Comment" onChange={ handleChange } className = "commentBox"></input>
              <AddCommentIcon fontSize='Large' onClick={ handleComment } style={{top: '22%', right: '5%', position: 'absolute', paddingTop: '2%', paddingBottom: 
            '2%'}}/>
            </span>
          </div>
      </div>
   : '' }
   {modal}
  </div>
  );
};


export default Project;
