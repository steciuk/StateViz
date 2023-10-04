const RUN_LOG_STYLE = `
text-transform: uppercase;
background: #000;
color: #FFF;
font-weight: bold;
padding: 5px 20px;
text-shadow: -1px -1px 0 rgba(251, 1, 252, 0.5),
              1px 1px 0 rgba(4, 251, 246, 0.5);`;

export function runLog(text: string) {
	console.log(`%c${text}`, RUN_LOG_STYLE);
}
