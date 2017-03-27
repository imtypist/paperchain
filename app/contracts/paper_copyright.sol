pragma solidity ^0.4.7;
contract PaperCopyright {
  struct Paper{
    string author;
    string fileHash;
    string title;
    uint date;
    uint blockNum;
    bool isPublic;
    uint index;
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
      isPublic: isPublic,
      blockNum:block.number,
      index:len
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
      isPublic: isPublic,
      blockNum:block.number,
      index:index
    });
  }
  
  function deletePaper(bytes20 sender,uint index) {
    if(sender != creator) throw;
    Paper p = papers[len-1];
    papers[index] = Paper({
        author: p.author,
        fileHash: p.fileHash,
        title: p.title,
        date: p.date,
        isPublic: p.isPublic,
        blockNum:p.blockNum,
        index:index
    });
    papers.length --;
    len --;
  }

  function getAllPaperInfo(bytes20 sender,uint index) constant returns(string,string,string,uint,bool,uint,uint){
    if(sender != creator) throw;
    Paper p = papers[index];
    return (p.author,p.fileHash,p.title,p.date,p.isPublic,p.blockNum,p.index);
  }

  function getPaperInfo(uint index) constant returns(string,string,string,uint,uint,uint){
    Paper p = papers[index];
    if(p.isPublic){
      return (p.author,p.fileHash,p.title,p.date,p.blockNum,p.index);
    }else{
      return ('false','false','false',0,0,0);
    }
  }

}