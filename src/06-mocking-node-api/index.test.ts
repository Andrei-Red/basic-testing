// Uncomment the code below and write your tests
import { doStuffByTimeout, doStuffByInterval, readFileAsynchronously } from '.';
import fs from 'fs';
import path from 'path';

describe('doStuffByTimeout', () => {
  let callback: () => void;
  let timeout: number;

  beforeEach(() => {
    jest.spyOn(global, 'setTimeout');
    callback = jest.fn();
    timeout = 300;
    doStuffByTimeout(callback, timeout);
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should set timeout with provided callback and timeout', () => {
    expect(setTimeout).toHaveBeenCalledWith(callback, timeout);
  });

  test('should call callback only after timeout', () => {
    doStuffByTimeout(callback, timeout);

    expect(callback).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(callback).toHaveBeenCalled();
  });
});

describe('doStuffByInterval', () => {
  let callback: () => void;
  let interval: number;

  beforeEach(() => {
    jest.spyOn(global, 'setInterval');
    callback = jest.fn();
    interval = 300;
    doStuffByTimeout(callback, interval);
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('should set interval with provided callback and timeout', () => {
    doStuffByInterval(callback, interval);

    expect(setInterval).toHaveBeenCalledWith(callback, interval);
    jest.spyOn(global, 'setInterval').mockRestore();
  });

  test('should call callback multiple times after multiple intervals', () => {
    doStuffByInterval(callback, interval);

    expect(callback).not.toBeCalled();
    jest.advanceTimersByTime(interval * 4);
    expect(callback).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(4);
  });
});

describe('readFileAsynchronously', () => {
  let joinSpy: object;
  let existsSyncSpy: object;
  let readFileSpy: object;

  beforeEach(() => {
    joinSpy = jest.spyOn(path, 'join');
    existsSyncSpy = jest.spyOn(fs, 'existsSync');
    readFileSpy = jest.spyOn(fs.promises, 'readFile');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should call join with pathToFile', async () => {
    const pathToFile = 'test.txt';
    await readFileAsynchronously(pathToFile);
    expect(joinSpy).toHaveBeenCalledWith(
      expect.stringContaining(__dirname),
      pathToFile,
    );
  });

  test('should return null if file does not exist', async () => {
    const pathToFile = 'nonexistent.txt';
    (
      existsSyncSpy as { mockReturnValueOnce: (a: boolean) => void }
    ).mockReturnValueOnce(false);
    const result = await readFileAsynchronously(pathToFile);

    expect(result).toBeNull();
  });

  test('should return file content if file exists', async () => {
    const pathToFile = 'existing.txt';
    const fileContent = 'Test content';

    (
      existsSyncSpy as { mockReturnValueOnce: (a: boolean) => void }
    ).mockReturnValueOnce(true);
    (
      readFileSpy as { mockResolvedValueOnce: (a: Buffer) => boolean }
    ).mockResolvedValueOnce(Buffer.from(fileContent));

    const result = await readFileAsynchronously(pathToFile);

    expect(result).toBe(fileContent);
  });
});
