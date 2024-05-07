import { createSignal, onMount } from 'solid-js'
import './App.css'



function App() {
  const [count, setCount] = createSignal(0)
  const [modsData, setModsData] = createSignal({"0": []})
  const [coreModsData, setCoreModsData] = createSignal({})
  onMount(async () => {
    const modsResponse = await fetch('./assets/mods.json')
    const modsJson = await modsResponse.json()
    const reorganizedModsData = {}
    for (const version in modsJson) {
      reorganizedModsData[version] = {}
      for (const mod of modsJson[version]) {
        const { id, ...modData } = mod
        if (!reorganizedModsData[version][id]) {
          reorganizedModsData[version][id] = []
        }
        reorganizedModsData[version][id].push(modData)
      }
    }
    const sortedReorganizedModsData = Object.keys(reorganizedModsData)
      .sort()
      .reverse()
      .reduce((sortedData, version) => {
        if (version != "undefined") {
          sortedData[version] = reorganizedModsData[version];
        }
        return sortedData;
      }, {});

    setModsData(sortedReorganizedModsData);

    const coreModsResponse = await fetch('./assets/core_mods.json')
    const coreModsJson = await coreModsResponse.json()
    setCoreModsData(coreModsJson)
  })

  function showMods(modData) {
    let modsForThisVersion = modsData()[modData.target.value];

  }

  return (
    <>
    <p>Select a version below</p>
      <select onChange={showMods} id="game_version" name="game_version">
      <For each={Object.keys(modsData())}> 
        {(version) =>
          <option value={version}>{version.split('_')[0]}</option>
        }
      </For>
      </select>

    </>
  )
}

export default App

