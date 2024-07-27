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

    const watched = entry.watched ? <input className='checkbox' type='checkbox' onClick={handleCheck} defaultChecked /> : <input className='checkbox' type='checkbox' onClick={handleCheck} />;

    return (
        <tr className='hover-color' id={entry.id}>
            <td className='entry' colSpan={2}>{entry.name}</td>
            <td className='entry' colSpan={1}>{entry.medium}</td>
            <td className='entry' colSpan={1}>{(new Date(entry.createdAt)).toDateString()}</td>
            <td className='entry' colSpan={1}>{entry.creatorName}</td>
            <td className='entry' colSpan={1}>{watched}</td>
        </tr>
    );
  }
