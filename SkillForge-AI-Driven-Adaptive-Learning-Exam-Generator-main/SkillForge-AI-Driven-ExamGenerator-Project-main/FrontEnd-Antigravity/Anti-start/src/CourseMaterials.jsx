import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    IconButton,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    CircularProgress
} from '@mui/material';
import {
    PlayCircle as VideoIcon,
    Description as PdfIcon,
    CloudDownload as DownloadIcon,
    Visibility as PreviewIcon,
    ArrowBack as ArrowBackIcon,
    Assessment as AssessmentIcon,
    Image as ImageIcon,
    Close as CloseIcon,
    Link as LinkIcon,
    Article as DocxIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { courseService } from './services/courseService';

const CourseMaterials = ({ courseId, topicId, onBack }) => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    useEffect(() => {
        const fetchMaterials = async () => {
            if (!topicId) return;
            setLoading(true);
            try {
                const data = await courseService.getMaterialsByTopic(topicId);
                setMaterials(data);
            } catch (error) {
                console.error("Error fetching materials:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, [topicId]);

    const handlePreview = (material) => {
        setSelectedMaterial(material);
        setPreviewOpen(true);
    };

    const formatYoutubeUrl = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11)
            ? `https://www.youtube.com/embed/${match[2]}`
            : url;
    };

    const getMaterialIcon = (type) => {
        const upperType = type?.toUpperCase();
        switch (upperType) {
            case 'VIDEO': return <VideoIcon />;
            case 'PDF': return <PdfIcon />;
            case 'IMAGE': return <ImageIcon />;
            case 'DOCX': return <DocxIcon />;
            case 'LINK': return <LinkIcon />;
            default: return <PdfIcon />;
        }
    };

    const getMaterialColor = (type) => {
        const upperType = type?.toUpperCase();
        switch (upperType) {
            case 'VIDEO': return { bg: '#fef2f2', color: '#ef4444' };
            case 'PDF': return { bg: '#fef3c7', color: '#f59e0b' };
            case 'IMAGE': return { bg: '#ecfdf5', color: '#10b981' };
            case 'DOCX': return { bg: '#eff6ff', color: '#3b82f6' };
            case 'LINK': return { bg: '#f5f3ff', color: '#8b5cf6' };
            default: return { bg: '#eff6ff', color: '#3b82f6' };
        }
    };

    const isBase64 = (url) => url?.startsWith('data:');

    const renderPreviewContent = () => {
        if (!selectedMaterial) return null;
        const { materialType, contentUrl, title } = selectedMaterial;
        const type = materialType?.toUpperCase();

        // Handle base64 encoded files
        if (isBase64(contentUrl)) {
            if (type === 'IMAGE' || contentUrl.startsWith('data:image')) {
                return (
                    <Box sx={{ p: 4, bgcolor: '#1e293b', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={contentUrl}
                            alt={title}
                            style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }}
                        />
                    </Box>
                );
            }
            if (type === 'PDF' || contentUrl.startsWith('data:application/pdf')) {
                return (
                    <Box sx={{ width: '100%', height: '70vh' }}>
                        <iframe
                            src={contentUrl}
                            width="100%"
                            height="100%"
                            title="PDF Preview"
                            style={{ border: 'none' }}
                        />
                    </Box>
                );
            }
            if (type === 'VIDEO' || contentUrl.startsWith('data:video')) {
                return (
                    <Box sx={{ p: 4, bgcolor: '#000', width: '100%' }}>
                        <video
                            controls
                            style={{ width: '100%', maxHeight: '70vh' }}
                            src={contentUrl}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </Box>
                );
            }
        }

        // Handle URL-based content
        switch (type) {
            case 'VIDEO':
                return (
                    <iframe
                        width="100%"
                        height="500px"
                        src={formatYoutubeUrl(contentUrl)}
                        title="Video Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                );
            case 'IMAGE':
                return (
                    <Box sx={{ p: 4, bgcolor: '#1e293b', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <img
                            src={contentUrl}
                            alt={title}
                            style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8 }}
                        />
                    </Box>
                );
            case 'PDF':
                return (
                    <Box sx={{ width: '100%', height: '70vh' }}>
                        <iframe
                            src={contentUrl}
                            width="100%"
                            height="100%"
                            title="PDF Preview"
                            style={{ border: 'none' }}
                        />
                    </Box>
                );
            case 'LINK':
                return (
                    <Box sx={{ p: 6, bgcolor: '#fff', width: '100%', textAlign: 'center' }}>
                        <LinkIcon sx={{ fontSize: 64, color: '#6366f1', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 3 }}>External Link</Typography>
                        <Button
                            variant="contained"
                            component="a"
                            href={contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ borderRadius: 3, px: 4 }}
                        >
                            Open Link in New Tab
                        </Button>
                    </Box>
                );
            case 'DOCX':
                return (
                    <Box sx={{ p: 6, bgcolor: '#fff', width: '100%', textAlign: 'center' }}>
                        <DocxIcon sx={{ fontSize: 64, color: '#3b82f6', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 3 }}>Word Document</Typography>
                        <Button
                            variant="contained"
                            component="a"
                            href={contentUrl}
                            download={title}
                            startIcon={<DownloadIcon />}
                            sx={{ borderRadius: 3, px: 4 }}
                        >
                            Download Document
                        </Button>
                    </Box>
                );
            default:
                return (
                    <Box sx={{ p: 6, bgcolor: '#fff', width: '100%', textAlign: 'center' }}>
                        <PdfIcon sx={{ fontSize: 64, color: '#64748b', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 3 }}>File Preview</Typography>
                        <Button
                            variant="contained"
                            component="a"
                            href={contentUrl}
                            target="_blank"
                            startIcon={<DownloadIcon />}
                            sx={{ borderRadius: 3, px: 4 }}
                        >
                            Open in New Tab
                        </Button>
                    </Box>
                );
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {onBack && (
                        <IconButton onClick={onBack} sx={{ color: '#64748b' }}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Learning Materials
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<AssessmentIcon />}
                    onClick={() => navigate(`/instructor/course/${courseId}/topic/${topicId}/quiz/analytics`)}
                    sx={{ borderRadius: '12px', fontWeight: 600, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#6366f1', color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.04)' } }}
                >
                    View Quiz Analytics
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : materials.length > 0 ? (
                <Grid container spacing={3}>
                    {materials.map((material) => {
                        const colors = getMaterialColor(material.materialType);
                        return (
                            <Grid item xs={12} sm={6} md={4} key={material.materialId}>
                                <Card sx={{
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                        transform: 'translateY(-4px)'
                                    }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Box sx={{
                                                p: 1.5,
                                                borderRadius: '12px',
                                                bgcolor: colors.bg,
                                                color: colors.color
                                            }}>
                                                {getMaterialIcon(material.materialType)}
                                            </Box>
                                            <Chip
                                                label={material.materialType}
                                                size="small"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.65rem',
                                                    height: 24,
                                                    bgcolor: colors.bg,
                                                    color: colors.color
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 2,
                                                color: 'text.primary',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                            title={material.title}
                                        >
                                            {material.title}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<PreviewIcon />}
                                                onClick={() => handlePreview(material)}
                                                sx={{
                                                    borderRadius: '10px',
                                                    textTransform: 'none',
                                                    fontWeight: 600,
                                                    bgcolor: '#1e293b',
                                                    '&:hover': { bgcolor: '#334155' }
                                                }}
                                            >
                                                View
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <Paper sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: '24px',
                    border: '2px dashed',
                    borderColor: 'divider',
                    bgcolor: 'transparent'
                }}>
                    <PdfIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
                    <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        No materials assigned for this topic yet.
                    </Typography>
                </Paper>
            )}

            {/* Preview Dialog */}
            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '24px', overflow: 'hidden' }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 3,
                    bgcolor: 'background.paper'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: getMaterialColor(selectedMaterial?.materialType).bg,
                            color: getMaterialColor(selectedMaterial?.materialType).color
                        }}>
                            {getMaterialIcon(selectedMaterial?.materialType)}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {selectedMaterial?.title}
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setPreviewOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#f1f5f9', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {renderPreviewContent()}
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
                    {selectedMaterial?.contentUrl && !isBase64(selectedMaterial.contentUrl) && (
                        <Button
                            variant="outlined"
                            component="a"
                            href={selectedMaterial.contentUrl}
                            target="_blank"
                            startIcon={<DownloadIcon />}
                            sx={{ borderRadius: 2, mr: 1 }}
                        >
                            Open Original
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        onClick={() => setPreviewOpen(false)}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseMaterials;
