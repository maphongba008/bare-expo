const fs = require("fs");

function parsePodfileLock(content) {
    const dependencies = {};
    let currentSection = null;
    
    content.split("\n").forEach(line => {
        line = line.trim();
        
        if (line.startsWith("DEPENDENCIES")) {
            currentSection = "dependencies";
        } else if (line.startsWith("SPEC REPOS") || line.startsWith("EXTERNAL SOURCES") || line.startsWith("CHECKOUT OPTIONS")) {
            currentSection = null;
        } else if (currentSection === "dependencies" && line.startsWith("- ")) {
            const match = line.match(/- ([^ (]+)(?: \(([^)]+)\))?/);
            if (match) {
                dependencies[match[1]] = match[2] || "unknown";
            }
        }
    });
    
    return dependencies;
}

function comparePodfileLocks(file1, file2) {
    const content1 = fs.readFileSync(file1, "utf8");
    const content2 = fs.readFileSync(file2, "utf8");
    
    const deps1 = parsePodfileLock(content1);
    const deps2 = parsePodfileLock(content2);
    
    const added = {};
    const removed = {};
    const changed = {};
    
    for (const dep in deps1) {
        if (!(dep in deps2)) {
            removed[dep] = deps1[dep];
        } else if (deps1[dep] !== deps2[dep]) {
            changed[dep] = { from: deps1[dep], to: deps2[dep] };
        }
    }
    
    for (const dep in deps2) {
        if (!(dep in deps1)) {
            added[dep] = deps2[dep];
        }
    }
    
    return { added, removed, changed };
}

// Example usage
const result = comparePodfileLocks("ios/Podfile.lock", "/Users/quynh/Documents/Bitfinex/Projects/AwesomeProject/ios/Podfile.lock");
console.log(result);
