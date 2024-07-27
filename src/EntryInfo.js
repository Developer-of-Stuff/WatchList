import { updateEntry } from "./App";

export default function EntryInfo(entry) {
    entry = entry.entry;

    async function handleCheck(e) {
        const target = e.target;
        const entryId = target.parentNode.parentNode.id;
        try {
          await updateEntry(entryId, target.checked);
        } catch (error) {
          console.error(error);
        }
      }

    return (
        <tr className='hover-color' id={entry.id}>
            <td className='entry' colSpan={2}>{entry.name}</td>
            <td className='entry' colSpan={1}>{entry.medium}</td>
            <td className='entry' colSpan={1}>{(new Date(entry.createdAt)).toDateString()}</td>
            <td className='entry' colSpan={1}>{entry.creatorName}</td>
            <td className='entry' colSpan={1}>{<input className='checkbox' type='checkbox' onClick={handleCheck} checked={entry.watched} onChange={() => null}/>}</td>
        </tr>
    );
  }
