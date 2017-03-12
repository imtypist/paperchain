pragma solidity ^0.4.7;
contract PaperCopyright {
  struct Paper{
    string author;
    string fileHash;
    string title;
    uint date;
    bool isPublic;
  }

  bytes20 private creator;

  Paper[] private papers;

  uint public len = 0;

  function PaperCopyright(bytes20 sender) {
    creator = sender;
  }

  function addPaper(bytes20 sender,string author,string file,string title,bool isPublic) {
    if(sender != creator) throw;
    papers.push(Paper({
      author: author,
      fileHash: file,
      title: title,
      date: now,
      isPublic: isPublic
    }));
    len += 1;
  }

  function editPaper(bytes20 sender,uint index,string author,string file,string title,bool isPublic) {
    if(sender != creator) throw;
    papers[index] = Paper({
      author: author,
      fileHash: file,
      title: title,
      date: now,
      isPublic: isPublic
    });
  }
  
  function deletePaper(bytes20 sender,string fileHash) {
    if(sender != creator) throw;
    for(var i = 0;i < len;i++) {
        if(compare(papers[i].fileHash,fileHash)) {
            Paper p = papers[len-1];
            papers[i] = Paper({
              author: p.author,
              fileHash: p.fileHash,
              title: p.title,
              date: p.date,
              isPublic: p.isPublic
            });
            papers.length --;
            len --;
            break;
        }
    }
  }

  function getAllPaperInfo(bytes20 sender,uint index) constant returns(string,string,string,uint,bool){
    if(sender != creator) throw;
    Paper p = papers[index];
    return (p.author,p.fileHash,p.title,p.date,p.isPublic);
  }

  function getPaperInfo(uint index) constant returns(string,string,string,uint){
    Paper p = papers[index];
    if(p.isPublic){
      return (p.author,p.fileHash,p.title,p.date);
    }else{
      return ('false','false','false',0);
    }
  }
  
  function compare(string storage _a, string memory _b) internal returns (bool) {
    bytes storage a = bytes(_a);
    bytes memory b = bytes(_b);
    if (a.length != b.length)
    	return false;
    // @todo unroll this loop
    for (uint i = 0; i < a.length; i ++)
    	if (a[i] != b[i])
    		return false;
    return true;
  }

}

