'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { getPatterns, verifyPattern } from '../../../../worker/src/api'; // Adjust path as needed
export default function MemoryInsights() {
    const [patterns, setPatterns] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getPatterns().then((res) => {
            if (res?.patterns)
                setPatterns(res.patterns);
            setLoading(false);
        });
    }, []);
    const handleVerify = async (id, action) => {
        // Optimistic UI update
        setPatterns((prev) => prev.filter(p => action === 'confirm' ? true : p.id !== id)
            .map(p => p.id === id ? { ...p, verified: action === 'confirm' ? 1 : -1 } : p));
        await verifyPattern(id, action);
    };
    if (loading)
        return _jsx("div", { className: "animate-pulse h-12 bg-gray-100 rounded-md" });
    if (patterns.length === 0)
        return null; // Hide if no memory exists yet
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6 my-6 shadow-sm", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4", children: "Relational Memory Insights" }), _jsx("div", { className: "space-y-4", children: patterns.filter(p => p.verified !== -1).map((pattern) => (_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-md", children: [_jsxs("div", { children: [_jsxs("span", { className: "inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-2", children: [pattern.pattern_type, " (Seen ", pattern.occurrence_count, "x)"] }), _jsx("p", { className: "text-gray-800 text-sm", children: pattern.content })] }), pattern.verified === 0 && (_jsxs("div", { className: "flex gap-2 shrink-0", children: [_jsx("button", { onClick: () => handleVerify(pattern.id, 'confirm'), className: "text-xs px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-800 transition", children: "Accurate" }), _jsx("button", { onClick: () => handleVerify(pattern.id, 'dismiss'), className: "text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition", children: "Dismiss" })] }))] }, pattern.id))) })] }));
}
//# sourceMappingURL=MemoryInsights.js.map