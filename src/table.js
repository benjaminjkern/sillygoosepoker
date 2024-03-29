import { minGames } from "./games.js";
import { formatMoney } from "./utils.js";

export let colors = {};

let sortingBy;
let reversingSort;
let PLAYERS;

export const renderTable = (
    players,
    sortedBy = sortingBy || 1,
    flipTable = true
) => {
    PLAYERS = [
        ...Object.keys(players)
            .map((name) => players[name])
            .filter((player) => player.games >= minGames),
    ];

    if (sortedBy === sortingBy && flipTable) {
        reversingSort = !reversingSort;
    } else {
        reversingSort = false;
    }
    sortingBy = sortedBy;

    PLAYERS.sort((a, b) =>
        (unpackPlayer(b)[sortedBy] > unpackPlayer(a)[sortedBy]) ^
        reversingSort ^
        (sortedBy === 0)
            ? 1
            : -1
    );

    for (const [p, player] of PLAYERS.entries()) {
        const lowercasename = player.name.toLowerCase();
        // if (colors[lowercasename]) continue;
        // colors[lowercasename] = `#${Math.random()
        //     .toString(16)
        //     .substring(2, 8)}`;
        colors[lowercasename] = `hsl(${Math.round(
            (p / PLAYERS.length) * 360
        )}, 100%, 50%)`;
    }
    const table = document.getElementById("table");
    table.innerHTML = "";
    renderRow(
        table,
        {
            name: "Name",
            profit: "Profit",
            score: "Score",
            games: "#Games",
            wins: "#Wins",
            draws: "#Draws",
            losses: "Losses",
            lastPlaces: "#Last",
            bestHand: "",
            secondBestHand: "",
            thirdBestHand: "",
        },
        true
    );
    for (const player of PLAYERS) {
        renderRow(table, player);
    }
};

const unpackPlayer = (player) => {
    const { name, score, profit, games, wins, draws, lastPlaces } = player;
    return [name, score, profit, games, wins, draws, lastPlaces];
};

const renderRow = (table, player, topRow) => {
    for (const [i, element] of unpackPlayer(player).entries()) {
        const cell = document.createElement("div");
        if (i === 1 && !topRow) {
            cell.innerHTML = element.toFixed(2);
            if (player.wasInLastGame && sortingBy === 1)
                cell.innerHTML +=
                    " " +
                    diff(player.score, player.previousScore, (s) =>
                        s.toFixed(2)
                    );
        } else if (i === 2 && !topRow) {
            cell.innerHTML = formatMoney(element);
            if (player.wasInLastGame && sortingBy === 2)
                cell.innerHTML +=
                    " " +
                    diff(player.profit, player.previousProfit, formatMoney);
        } else {
            cell.innerHTML = element;
            if (player.wasInLastGame && sortingBy === i && i >= 3)
                cell.innerHTML +=
                    " " + diff(element, player.previousStats[i - 3]);
        }
        if (topRow) {
            cell.classList.add("toprow");
            cell.onclick = () => {
                renderTable(PLAYERS, i);
            };
            if (i === sortingBy) {
                cell.innerHTML += `<span>${
                    reversingSort ? "&#9650;" : "&#9660;"
                }</span>`;
            }
        }
        if (i === sortingBy) cell.classList.add("selected");
        if (i % 2 === 0) cell.classList.add("odd");
        if (i === 0) cell.classList.add("first-child");
        if (i === 6) cell.classList.add("last-child");
        table.appendChild(cell);
    }
};

const diff = (current, prev, numberMask = (s) => s) => {
    const diffAmount = current - prev;
    if (diffAmount === 0) return "";
    return `<br class="breakformobile"><span style="color: ${
        diffAmount >= 0 ? "green" : "red"
    }">${diffAmount > 0 ? "+" : ""}${numberMask(diffAmount)}</span>`;
};
