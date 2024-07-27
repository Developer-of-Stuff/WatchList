import { updateEntry, deleteEntry } from "./App";

export default function EntryButtons() {
      
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

    return (
        <tr>
            <td colSpan={6}>
                <button className='btn op-btn' onClick={handleLocalUpdate}>Update Item</button>
                <button className='btn op-btn' onClick={handleLocalDelete}>Delete Item</button>
            </td>
        </tr>
    );
}