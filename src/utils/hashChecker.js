/*  
1. receives the hash
2. checks if the hash was already seen
3. if yes, tells process we don't need it again
   if no, stores the hash
4. autodeletes after 1 minute
*/
const hashSet = new Set();
const second = 1000;
export default function hashChecker(hash) {
  if (hashSet.has(hash)) {
    console.log("hashChecker found a dup!", hash);
    return true;
  } else {
    hashSet.add(hash);
    setTimeout((hash) => {
      hashSet.delete(hash);
    }, second * 60);
    return false;
  }
}
