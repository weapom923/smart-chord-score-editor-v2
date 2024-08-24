#include "./waveform_decimator.hpp"
#include <limits>
#include <stdexcept>
#include <vector>
#include <array>

#if defined(_MSC_VER)
#   define SCSE_LITTLE_ENDIAN
#else
#   if defined(__LITTLE_ENDIAN__)
#       define SCSE_LITTLE_ENDIAN
#   elif defined(__BIG_ENDIAN__)
#       define SCSE_BIG_ENDIAN
#   else
#       if defined(__GNUC__)
#           if (__BYTE_ORDER__ == __ORDER_LITTLE_ENDIAN__)
#               define SCSE_LITTLE_ENDIAN
#           endif
#           if (__BYTE_ORDER__ == __ORDER_BIG_ENDIAN__)
#               define SCSE_BIG_ENDIAN
#           endif
#       elif defined(EMSCRIPTEN)
#           define SCSE_LITTLE_ENDIAN
#       endif
#   endif
#endif

#if !defined(SCSE_LITTLE_ENDIAN) && !defined(SCSE_BIG_ENDIAN)
#   error "unsupported endian"
#endif

namespace scse { namespace waveform_decimator {

    namespace {
        namespace detail {
            constexpr std::uint32_t numDecimatedSamplesMin = 800;

            template <class T> constexpr T min(T x, T y) { return (x < y)? x : y; }

            template <class T> constexpr T max(T x, T y) { return (x > y)? x : y; }

            template <typename T>
            typename std::enable_if<std::is_integral<T>::value, T>::type halfRoundUp(T x)
            {
                return static_cast<T>((x + 1) / 2);
            }

            template <class T>
            void writeInLittleEndian(std::ostream& ostream, T value)
            {
                const char* byte = reinterpret_cast<const char*>(&value);
#if defined(SCSE_LITTLE_ENDIAN)
                ostream.write(byte, sizeof(T));
#elif defined(SCSE_BIG_ENDIAN)
                for (std::size_t byteOffset = 0; byteOffset < sizeof(T); ++byteOffset) {
                    ostream.write(&byte[byteOffset], sizeof(char));
                }
#endif
            }

            template <class T>
            void writeVectorInLittleEndian(std::ostream& ostream, const std::vector<T>& vector)
            {
#if defined(SCSE_LITTLE_ENDIAN)
                const char* byte = reinterpret_cast<const char*>(vector.data());
                ostream.write(byte, vector.size() * sizeof(T));
#elif defined(SCSE_BIG_ENDIAN)
                for (const T& data: vector) {
                    auto byte = reinterpret_cast<const char*>(&data);
                    for (std::size_t byteOffset = 0; byteOffset < sizeof(T); ++byteOffset) {
                        ostream.write(&byte[byteOffset], sizeof(char));
                    }
                }
#endif
            }

            constexpr std::uint32_t getDecimationLevelMax(std::uint32_t numLpcmSamples)
            {
                std::uint32_t numSequenceDigestLevels = 0;
                while (numLpcmSamples > detail::numDecimatedSamplesMin) {
                    numLpcmSamples /= 2;
                    ++numSequenceDigestLevels;
                }
                return numSequenceDigestLevels;
            }
        }
    }


    void generate(
        std::ostream& ostream,
        const sample_type** lpcmSamples,
        std::uint32_t numChannels,
        std::uint32_t numOriginalSamples)
    {
        detail::writeInLittleEndian(ostream, numChannels);
        detail::writeInLittleEndian(ostream, numOriginalSamples);

        const auto decimationLevelMax = detail::getDecimationLevelMax(numOriginalSamples);
        detail::writeInLittleEndian(ostream, decimationLevelMax);
        const auto decimatedSamplesByLevelIdxMax = decimationLevelMax - 1;

        for (std::uint32_t channelIdx = 0; channelIdx < numChannels; ++channelIdx) {
            const auto* originalLpcmSamplesByChannel = lpcmSamples[channelIdx];
            detail::writeVectorInLittleEndian(ostream, std::vector(originalLpcmSamplesByChannel, originalLpcmSamplesByChannel + numOriginalSamples));

            // level / min-max / sample
            auto decimatedSamplesFirstLevel = std::array<std::vector<sample_type>, 2>({
                std::vector<sample_type>(),
                std::vector<sample_type>(),
            });
            auto decimatedSamplesMinFirstLevel = std::vector<sample_type>();
            auto decimatedSamplesMaxFirstLevel = std::vector<sample_type>();
            auto currentNumDecimatedSamples = detail::halfRoundUp(numOriginalSamples);
            detail::writeInLittleEndian(ostream, currentNumDecimatedSamples);
            decimatedSamplesMinFirstLevel.reserve(currentNumDecimatedSamples);
            decimatedSamplesMaxFirstLevel.reserve(currentNumDecimatedSamples);
            for (std::uint32_t originalSampleIdx = 0; originalSampleIdx < numOriginalSamples; originalSampleIdx += 2) {
                const auto sampleIdxX = originalSampleIdx;
                const auto sampleIdxY = detail::min( originalSampleIdx + 1, numOriginalSamples - 1);
                const auto sampleX = originalLpcmSamplesByChannel[sampleIdxX];
                const auto sampleY = originalLpcmSamplesByChannel[sampleIdxY];
                const auto sampleMin = detail::min(sampleX, sampleY);
                const auto sampleMax = detail::max(sampleX, sampleY);
                decimatedSamplesMinFirstLevel.emplace_back(sampleMin);
                decimatedSamplesMaxFirstLevel.emplace_back(sampleMax);
            }
            detail::writeVectorInLittleEndian(ostream, decimatedSamplesMinFirstLevel);
            detail::writeVectorInLittleEndian(ostream, decimatedSamplesMaxFirstLevel);

            auto previousLevelDecimatedSamplesMin = std::vector<sample_type>(decimatedSamplesMinFirstLevel);
            auto previousLevelDecimatedSamplesMax = std::vector<sample_type>(decimatedSamplesMaxFirstLevel);

            for (
                std::uint32_t decimatedSamplesByLevelIdx = 1;
                decimatedSamplesByLevelIdx <= decimatedSamplesByLevelIdxMax;
                ++decimatedSamplesByLevelIdx)
            {
                const auto previousDecimatedSampleIdxMax = currentNumDecimatedSamples - 1;

                currentNumDecimatedSamples = detail::halfRoundUp(currentNumDecimatedSamples);
                detail::writeInLittleEndian(ostream, currentNumDecimatedSamples);
                auto currentLevelDecimatedSamplesMin = std::vector<sample_type>();
                auto currentLevelDecimatedSamplesMax = std::vector<sample_type>();
                currentLevelDecimatedSamplesMin.reserve(currentNumDecimatedSamples);
                currentLevelDecimatedSamplesMax.reserve(currentNumDecimatedSamples);
                for (
                    std::uint32_t currentDecimatedSampleIdx = 0;
                    currentDecimatedSampleIdx < currentNumDecimatedSamples;
                    ++currentDecimatedSampleIdx)
                {
                    const auto previousDecimatedSampleXIdx = currentDecimatedSampleIdx * 2;
                    const auto previousDecimatedSampleYIdx = detail::min(previousDecimatedSampleXIdx + 1, previousDecimatedSampleIdxMax);

                    const sample_type sampleMinX = previousLevelDecimatedSamplesMin[previousDecimatedSampleXIdx];
                    const sample_type sampleMinY = previousLevelDecimatedSamplesMin[previousDecimatedSampleYIdx];
                    const sample_type sampleMaxX = previousLevelDecimatedSamplesMax[previousDecimatedSampleXIdx];
                    const sample_type sampleMaxY = previousLevelDecimatedSamplesMax[previousDecimatedSampleYIdx];
                    const sample_type sampleMin = detail::min(sampleMinX, sampleMinY);
                    const sample_type sampleMax = detail::max(sampleMaxX, sampleMaxY);
                    currentLevelDecimatedSamplesMin.emplace_back(sampleMin);
                    currentLevelDecimatedSamplesMax.emplace_back(sampleMax);
                }
                detail::writeVectorInLittleEndian(ostream, currentLevelDecimatedSamplesMin);
                detail::writeVectorInLittleEndian(ostream, currentLevelDecimatedSamplesMax);

                if (decimatedSamplesByLevelIdx < decimatedSamplesByLevelIdxMax) {
                    previousLevelDecimatedSamplesMin = std::vector<sample_type>(currentLevelDecimatedSamplesMin);
                    previousLevelDecimatedSamplesMax = std::vector<sample_type>(currentLevelDecimatedSamplesMax);
                }
            }
        }
    }
}}