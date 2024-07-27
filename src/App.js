import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import * as subscriptions from './graphql/subscriptions';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import config from './amplifyconfiguration.json';
Amplify.configure(config);

const appsyncClient = generateClient();
let numEntries = 0;

async function retrieveEntries() {
  const entriesList = await appsyncClient.graphql({
    query: queries.listMedia
  });

  return entriesList.data.listMedia;
}

async function addEntry(formDataObj, user) {
  const addMediaResult = await appsyncClient.graphql({
    query: mutations.createMedia,
    variables: {
      input: {
        name: formDataObj.title,
        medium: formDataObj.medium === 'movie' ? 'MOVIE' : 'SHOW',
        creatorId: user.username,
        creatorName: user.signInDetails.loginId,
        watched: false
      }
    }
  });

  console.log(addMediaResult);
  return addMediaResult.data.createMedia;
}

async function updateEntry(id, watched, formDataObj = null, name = null, medium = null) {
  let input;

  if (formDataObj) {
    console.log(`formDataObj`)
    input = {
      id: id,
      name: formDataObj.title,
      medium: formDataObj.medium === 'movie' ? 'MOVIE' : 'SHOW',
      watched: formDataObj.watched
    }
  } else if (name && medium) {
    input = {
      id: id,
      name: name,
      medium: medium,
      watched: watched
    }
  } else {
    input = {
      id: id,
      watched: watched
    }
  }

  const updateMediaResult = await appsyncClient.graphql({
    query: mutations.updateMedia,
    variables: {
      input: input
    }
  });

  console.log(updateMediaResult);
}

async function deleteEntry(id) {
  const deleteMediaResult = await appsyncClient.graphql({
    query: mutations.deleteMedia,
    variables: {
      input: {
        id: id
      }
    }
  });

  console.log(deleteMediaResult);
}

function createEntry(entry, index) {
  const entries = [];
  const wasWatched = <input className='checkbox' type='checkbox' onClick={handleCheck} defaultChecked />
  const notWatched = <input className='checkbox' type='checkbox' onClick={handleCheck} />
  entries.push(
    <tr key={index + "-info"} className='hover-color' id={entry.id}>
      <td className='entry' colSpan={2}>{entry.name}</td>
      <td className='entry' colSpan={1}>{entry.medium}</td>
      <td className='entry' colSpan={1}>{(new Date(entry.createdAt)).toDateString()}</td>
      <td className='entry' colSpan={1}>{entry.creatorName}</td>
      <td className='entry' colSpan={1}>{entry.watched ? wasWatched : notWatched}</td>
    </tr>
  );
  entries.push(
    <tr key={index + "-btns"} id={entry.id + "-btns"}>
      <td colSpan={6}>
        <button className='btn op-btn' onClick={handleLocalUpdate}>Update Item</button>
        <button className='btn op-btn' onClick={handleLocalDelete}>Delete Item</button>
      </td>
    </tr>
  )

  return entries;
}

async function handleCheck(e) {
  const target = e.target;
  const entryId = target.parentNode.parentNode.id;
  try {
    await updateEntry(entryId, target.checked);
  } catch (error) {
    console.error(error);
  }
}

async function handleLocalUpdate(e) {
  const updateBtnRow = e.target.parentNode.parentNode;
  const updateInfoRow = updateBtnRow.previousSibling;
  const titleEntry = updateInfoRow.firstChild;
  const typeEntry = updateInfoRow.childNodes[1];
  const entryId = updateInfoRow.id;

  if (!titleEntry.className.includes("update")) {
    const titleText = titleEntry.textContent;
    const newTitleHTML = `<input class='test-input' type='text' value='${titleText}' placeholder='Title' />`;
    titleEntry.innerHTML = newTitleHTML;
    titleEntry.className += " update";

    const typeValue = typeEntry.textContent;
    const newTypeHTML = typeValue === "MOVIE" ?
      `<select class='test-input'>
      <option class='input' value='movie' selected>Movie</option>
      <option class='input' value='show'>Show</option>
    </select>` :
      `<select class='test-input'>
      <option class='input' value='movie'>Movie</option>
      <option class='input' value='show' selected>Show</option>
    </select>`;
    typeEntry.innerHTML = newTypeHTML;
  } else {
    const inputTitleChild = titleEntry.firstChild;
    const inputTitleText = inputTitleChild.value;
    inputTitleChild.remove();
    titleEntry.textContent = inputTitleText;

    const inputTypeChild = typeEntry.firstChild;
    const inputTypeValue = inputTypeChild.value;
    inputTypeChild.remove();
    typeEntry.textContent = inputTypeValue.toUpperCase();

    const watched = updateInfoRow.lastChild.firstChild.checked;

    try {
      await updateEntry(entryId, watched, null, inputTitleText, inputTypeValue.toUpperCase());
    } catch (error) {
      console.error("Failed to update entry:\n\n", `Input: ${entryId}, ${watched}, ${inputTitleText}, ${inputTypeValue.toUpperCase()}\n\n`, error);
    }

    titleEntry.className = "entry";
  }

}

async function handleLocalDelete(e) {
  const entryId = e.target.parentNode.parentNode.previousSibling.id;
  try {
    await deleteEntry(entryId);
  } catch (error) {
    console.error("Delete handler error:\n", error);
  }
}

function defaultSort(entries) {
  entries.sort((a, b) => {
    if (new Date(a.updatedAt) > new Date(b.updatedAt)) {
      return -1;
    } else {
      return 1;
    }
  });

  return entries;
}

function App({ signOut, user }) {

  const [entries, setEntries] = useState();

  useEffect(() => {
    document.title = "Watch List";

    async function loadEntries() {
      const entries = (await retrieveEntries()).items;
      const sortedEntries = defaultSort(entries);
      numEntries = sortedEntries.length;
      setEntries(createEntries(sortedEntries));
      console.log("Loaded entries")
    }

    function createEntries(mediaEntries) {
      const entries = [];

      for (let i = 0; i < mediaEntries.length; i++) {
        entries.push(createEntry(mediaEntries[i], i));
      }

      return entries;
    }

    loadEntries();

    const createEntrySub = appsyncClient
      .graphql({ query: subscriptions.onCreateMedia })
      .subscribe({
        next: ({ data }) => {
          console.log(data);
          const entry = data.onCreateMedia
          const newEntry = createEntry(entry, numEntries + 1);

          setEntries((entries) => {
            console.log(entries);
            return [newEntry, ...entries]
          });
          numEntries++;
        },
        error: (error) => console.warn(error)
      });

    const updateEntrySub = appsyncClient
      .graphql({ query: subscriptions.onUpdateMedia })
      .subscribe({
        next: ({ data }) => {
          const entryId = data.onUpdateMedia.id;
          setEntries((entries) => {
            return entries.map(entry => {
              if (entry[0].props.id === entryId) {
                console.log(`onUpdateMedia:\n${JSON.stringify(data.onUpdateMedia)}`);
                return createEntry(data.onUpdateMedia, Number(entry[0].key.split('-')[0]));
              } else {
                return entry;
              }
            })
          })
        },
        error: (error) => console.warn(error)
      });

    const deleteEntrySub = appsyncClient
      .graphql({ query: subscriptions.onDeleteMedia })
      .subscribe({
        next: ({ data }) => {
          console.log(data);
          const entryId = data.onDeleteMedia.id;
          setEntries((entries) => {
            return entries.filter((entry) => entry[0].props.id !== entryId)
          });
          numEntries--;
          
          console.log(`Entry ID ${entryId} deleted.`);
        },
        error: (error) => console.warn(error)
      });

      return () => {
        createEntrySub.unsubscribe();
        updateEntrySub.unsubscribe();
        deleteEntrySub.unsubscribe();
      }
  }, []);



  async function formSubmit(e) {
    e.preventDefault();
    console.log('submit form event fired');
    let form = e.target;
    let formData = new FormData(form);
    let formDataObj = Object.fromEntries(formData.entries())
    console.log(formDataObj);

    if (formDataObj.title === '') {
      alert('Title is required')
    }

    else {
      try {
        await addEntry(formDataObj, user);
      } catch (error) {
        console.error(error);
      }
    }
  };


  return (
    <div className='app-container'>
      <div className='body'>
        <div className='space-btwn-flex header border-bottom'>
          <h1>
            <a href="/">Watch List</a>
          </h1>
          <nav>
            <ul className='space-btwn-flex'>
              <li><a className='hover-color' href='/'>Home</a></li>
              <li><a className='hover-color' href='/about'>About</a></li>
            </ul>
          </nav>
        </div>
        <div className='main'>
          <div className='space-btwn-flex section border-bottom'>
            <h2>Welcome, {user.signInDetails.loginId}!</h2>
            <button className='btn' onClick={signOut}>Sign Out</button>
          </div>
          <div className='section border-bottom'>
            <h2>Media Entry</h2>
            <form id='media-form' onSubmit={formSubmit}>
              <label htmlFor='title'>Title:</label>
              <input className='test-input' id='form-title' name='title' type='text' />
              <label htmlFor='medium'>Type:</label>
              <select className='test-input' id='form-medium' name='medium'>
                <option className='input' value='movie'>Movie</option>
                <option className='input' value='show'>Show</option>
              </select>
              <button className='btn' type='submit' id='form-submit'>Submit</button>
            </form>
          </div>
          <div className='section border-bottom'>
            <h2>Entries</h2>
            <table id='entry-table'>
              <thead>
                <tr>
                  <td colSpan={2}>Title</td>
                  <td>Type</td>
                  <td>Creation Time</td>
                  <td>Creator</td>
                  <td>Watched</td>
                </tr>
              </thead>
              <tbody>
                {entries}
              </tbody>
            </table>
          </div>
        </div>
        <div className='section footer center-text'>
          <p>&copy; Watch List 2024</p>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);