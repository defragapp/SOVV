export declare function safetyMode(text: string): "normal" | "support";
export declare function supportResponse(): {
    type: "support";
    message: string;
    resources: {
        label: string;
        link: string;
    }[];
    confidence: "Support mode";
};
//# sourceMappingURL=safety.d.ts.map