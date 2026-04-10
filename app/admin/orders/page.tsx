'use client';

import { useState, useEffect } from 'react';

const TERRA = '#B5623E';
const TERRA_DARK = '#8C4530';
const INK = '#1C1814';
const INK_MID = '#4A3F35';
const INK_LIGHT = '#8C7B6E';
const CREAM = '#F8F4EE';
const WHITE = '#FDFCFA';
const CLAY = '#D4C4B0';

const statusColors: Record<string, string> = {
    'pending': '#f59e0b',
    'confirmed': '#3b82f6',
    'processing': '#8b5cf6',
    'shipped': '#06b6d4',
    'on-the-road': '#10b981',
    'delivered': '#059669',
    'cancelled': '#ef4444'
};

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'on-the-road', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [status, setStatus] = useState('');
    const [filter, setFilter] = useState('all');

    // Helper function to get English text from multilingual objects
    const getText = (value: any): string => {
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null) {
            return value.en || 'N/A';
        }
        return String(value);
    };

    useEffect(() => {
        fetchAllOrders();
    }, []);

    const fetchAllOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/orders');
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setStatus('❌ Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const updatedOrder = await response.json();
                setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
                setStatus('✓ Status updated successfully');
                setTimeout(() => setStatus(''), 3000);
            } else {
                setStatus('❌ Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setStatus('❌ Error updating status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        if (!confirm('Delete this order?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setOrders(orders.filter(o => o._id !== orderId));
                setSelectedOrder(null);
                setStatus('✓ Order deleted');
                setTimeout(() => setStatus(''), 3000);
            } else {
                setStatus('❌ Can only delete pending orders');
            }
        } catch (error) {
            setStatus('❌ Error deleting order');
        }
    };

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ color: INK, fontSize: '32px', marginBottom: '24px' }}>Manage Orders</h1>

            {status && (
                <div style={{
                    padding: '12px 16px',
                    marginBottom: '16px',
                    borderRadius: '4px',
                    backgroundColor: status.includes('✓') ? '#d1fae5' : '#fee2e2',
                    color: status.includes('✓') ? '#065f46' : '#dc2626'
                }}>
                    {status}
                </div>
            )}

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['all', ...statusOptions].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: filter === status ? TERRA : WHITE,
                            color: filter === status ? WHITE : INK,
                            border: `1px solid ${CLAY}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {loading ? (
                <p style={{ color: INK_LIGHT }}>Loading orders...</p>
            ) : filteredOrders.length === 0 ? (
                <p style={{ color: INK_LIGHT }}>No orders found.</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px'
                }}>
                    {/* Orders List */}
                    <div>
                        <h2 style={{ color: TERRA, fontSize: '16px', marginBottom: '16px', fontWeight: '600' }}>
                            Orders ({filteredOrders.length})
                        </h2>
                        <div style={{ display: 'grid', gap: '8px', maxHeight: '600px', overflowY: 'auto' }}>
                            {filteredOrders.map(order => (
                                <div
                                    key={order._id}
                                    onClick={() => setSelectedOrder(order)}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: selectedOrder?._id === order._id ? CREAM : WHITE,
                                        border: `1px solid ${selectedOrder?._id === order._id ? TERRA : CLAY}`,
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ color: INK, fontSize: '12px', fontWeight: '600' }}>
                                                #{order._id.slice(-6).toUpperCase()}
                                            </p>
                                            <p style={{ color: INK_LIGHT, fontSize: '11px' }}>
                                                {order.customerInfo.name}
                                            </p>
                                        </div>
                                        <span style={{
                                            padding: '4px 8px',
                                            backgroundColor: statusColors[order.status],
                                            color: WHITE,
                                            borderRadius: '3px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            textTransform: 'capitalize'
                                        }}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Details */}
                    {selectedOrder && (
                        <div style={{
                            backgroundColor: WHITE,
                            border: `1px solid ${CLAY}`,
                            borderRadius: '4px',
                            padding: '20px',
                            maxHeight: '600px',
                            overflowY: 'auto'
                        }}>
                            <h2 style={{ color: TERRA, fontSize: '16px', marginBottom: '16px', fontWeight: '600' }}>
                                Order Details
                            </h2>

                            {/* Basic Info */}
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ color: INK_LIGHT, fontSize: '10px', fontWeight: '600', marginBottom: '4px' }}>
                                    ORDER ID
                                </p>
                                <p style={{ color: INK, fontSize: '14px', fontWeight: '600' }}>
                                    {selectedOrder._id}
                                </p>
                            </div>

                            {/* Customer Info */}
                            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${CLAY}` }}>
                                <h3 style={{ color: TERRA, fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
                                    CUSTOMER INFORMATION
                                </h3>
                                <p style={{ color: INK, fontSize: '13px', marginBottom: '4px' }}>
                                    <strong>Name:</strong> {selectedOrder.customerInfo.name}
                                </p>
                                <p style={{ color: INK, fontSize: '13px', marginBottom: '4px' }}>
                                    <strong>Email:</strong> {selectedOrder.customerInfo.email}
                                </p>
                                <p style={{ color: INK, fontSize: '13px', marginBottom: '4px' }}>
                                    <strong>Phone:</strong> {selectedOrder.customerInfo.phone}
                                </p>
                            </div>

                            {/* Recipient Info */}
                            {selectedOrder.customerInfo.recipientName && (
                                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${CLAY}` }}>
                                    <h3 style={{ color: TERRA, fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
                                        RECIPIENT INFORMATION
                                    </h3>
                                    <p style={{ color: INK, fontSize: '13px', marginBottom: '4px' }}>
                                        <strong>Name:</strong> {selectedOrder.customerInfo.recipientName}
                                    </p>
                                    <p style={{ color: INK, fontSize: '13px' }}>
                                        <strong>Phone:</strong> {selectedOrder.customerInfo.recipientPhone}
                                    </p>
                                </div>
                            )}

                            {/* Delivery Address */}
                            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${CLAY}` }}>
                                <h3 style={{ color: TERRA, fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
                                    DELIVERY ADDRESS
                                </h3>
                                <p style={{ color: INK, fontSize: '13px', lineHeight: '1.6' }}>
                                    {selectedOrder.deliveryAddress.street}<br />
                                    {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.postalCode}<br />
                                    {selectedOrder.deliveryAddress.country}
                                </p>
                            </div>

                            {/* Items */}
                            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: `1px solid ${CLAY}` }}>
                                <h3 style={{ color: TERRA, fontSize: '12px', marginBottom: '12px', fontWeight: '600' }}>
                                    ITEMS ({selectedOrder.books.length})
                                </h3>
                                {selectedOrder.books.map((book: any, idx: number) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{ color: INK }}>{getText(book.name)} x{book.quantity}</span>
                                        <span style={{ color: INK, fontWeight: '600' }}>
                                            ${(book.price * book.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '12px',
                                    paddingTop: '8px',
                                    borderTop: `1px solid ${CLAY}`,
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: TERRA
                                }}>
                                    <span>Total:</span>
                                    <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', color: TERRA, fontSize: '12px', marginBottom: '8px', fontWeight: '600' }}>
                                    UPDATE STATUS
                                </label>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                                    disabled={updatingId === selectedOrder._id}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: `1px solid ${CLAY}`,
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: updatingId ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {statusOptions.map(status => (
                                        <option key={status} value={status} style={{ textTransform: 'capitalize' }}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Delete Button */}
                            {selectedOrder.status === 'cancelled' && (
                                <button
                                    onClick={() => handleDeleteOrder(selectedOrder._id)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        backgroundColor: '#ef4444',
                                        color: WHITE,
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Delete Order
                                </button>
                            )}

                            {/* Dates */}
                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${CLAY}`, fontSize: '11px', color: INK_LIGHT }}>
                                <p>Created: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                <p>Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}