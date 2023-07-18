export type ScoreMetadataRawObj = {
  title: string;
  composer_name: string;
  arranger_name: string;
  lyricist_name: string;
  artist_name: string;
}

export class ScoreMetadata {
  title: string;
  composerName: string;
  arrangerName: string;
  lyricistName: string;
  artistName: string;

  constructor(
    title = '',
    composerName = '',
    arrangerName = '',
    lyricistName = '',
    artistName = '',
  ) {
    this.title = title;
    this.composerName = composerName;
    this.arrangerName = arrangerName;
    this.lyricistName = lyricistName;
    this.artistName = artistName;
  }

  getRawObj(): ScoreMetadataRawObj {
    return {
      title: this.title,
      composer_name: this.composerName,
      arranger_name: this.arrangerName,
      lyricist_name: this.lyricistName,
      artist_name: this.artistName,
    };
  }

  static loadFromRawObj(rawObj: ScoreMetadataRawObj) {
    return new ScoreMetadata(
      rawObj.title,
      rawObj.composer_name,
      rawObj.arranger_name,
      rawObj.lyricist_name,
      rawObj.artist_name,
    );
  }

  clone(): ScoreMetadata {
    return ScoreMetadata.loadFromRawObj(this.getRawObj());
  }

  assign(that: ScoreMetadata) {
    this.title = that.title;
    this.composerName = that.composerName;
    this.arrangerName = that.arrangerName;
    this.lyricistName = that.lyricistName;
    this.artistName = that.artistName;
  }

  isEqualTo(that: ScoreMetadata) {
    if (this.title !== that.title) return false;
    if (this.composerName !== that.composerName) return false;
    if (this.arrangerName !== that.arrangerName) return false;
    if (this.lyricistName !== that.lyricistName) return false;
    if (this.artistName !== that.artistName) return false;
    return true;
  }

  isSameAs(that: ScoreMetadata) { return this.isEqualTo(that) }
}
