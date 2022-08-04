export = Koder;
declare class Koder {
    get initialized(): Koder;
    mod: any;
    api: {
        createBuffer: any;
        deleteBuffer: any;
        triggerDecode: any;
        getScanResults: any;
    };
    decode(imgData: any, width: number, height: number): string;
}
//# sourceMappingURL=index.d.ts.map