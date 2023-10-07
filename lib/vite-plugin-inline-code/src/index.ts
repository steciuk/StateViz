import { PluginOption } from 'vite';

function randomVarName() {
	return `var${Math.random().toString().slice(2)}`;
}

export function inlineCode(modulesToInline: string[] = []): PluginOption {
	const codeMap = new Map<string, string>();
	const inlineTag = '!inline!';

	return {
		name: 'inline-code',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			if (!modulesToInline.some((module) => source.includes(module))) return;

			const resolution = await this.resolve(source, importer, {
				skipSelf: true,
				...options,
			});
			if (!resolution) return;

			const code = await this.load({ id: resolution.id });
			if (!code.code) return;
			codeMap.set(resolution.id, code.code);

			return { id: `${randomVarName()}${inlineTag}${resolution.id}` };
		},
		load(id) {
			if (id.includes(inlineTag)) {
				const realId = id.split(inlineTag)[1];
				const code = codeMap.get(realId);
				if (!code) return;

				return code;
			}
		},
	};
}
